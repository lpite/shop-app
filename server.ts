import fastify from "fastify";
import cors from "@fastify/cors";
import path from "path";

import { number, object, z as zod } from "zod";

import { sequelize } from "./lib/sequelize";

import { ProductModel, productModel } from "./models/product";
import { saleDocumentModel } from "./models/saleDocument";
import { incomeDocumentModel } from "./models/incomeDocument";
import {
  incomeDocumentProductModel,
  saleDocumentProductModel,
} from "./models/documentProduct";

import countProductQuantity from "./lib/countProductQuantity";

const app = fastify();

app.register(cors);
app.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
});

app.get<{
  Querystring: { productId?: string };
  // Reply: Product | {}; for now
}>("/get/product/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      productId: zod.string(),
    });
    const { productId } = queryValidator.parse(req.query);

    const product = await productModel.findByPk(parseInt(productId));
    if (!product) {
      throw new Error("No product");
    }

    res.send({ ...product.dataValues, quantity: 0 });
  } catch (error) {
    console.error(error);
    res.send({});
  }
});

app.get<{
  Querystring: { skip?: string };
  Reply: ProductModel[];
}>("/get/products/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      skip: zod.string().transform((val) => parseInt(val)),
    });
    const { skip } = queryValidator.parse(req.query);

    const products = await productModel.findAll({
      offset: skip,
      limit: 100,
    });
    const quantities = await countProductQuantity({ products: products });
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      product.setDataValue("quantity", quantities[product.product_id]);
    }
    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(400).send([]);
  }
});

app.post<{
  Body: { name?: string };
  Reply: { ok: boolean };
}>("/create/product/", async (req, res) => {
  try {
    const bodyValidator = zod.object({
      name: zod.string().min(1),
    });

    const body = bodyValidator.parse(req.body);
    const { name } = body;
    await productModel.create({
      name: name,
    });

    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.patch<{
  Querystring: { productId?: string };
  Body: ProductModel;
  Reply: { ok: boolean };
}>("/update/product/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      productId: zod.string().transform((val) => parseInt(val)),
    });
    const bodyValidator = zod.object({
      product_id: zod.number(),
      name: zod.string(),
    });
    const body = bodyValidator.parse(req.body);
    const query = queryValidator.parse(req.query);
    await productModel.update(
      {
        product_id: body.product_id,
        name: body.name,
      },
      {
        where: {
          product_id: query.productId,
        },
      }
    );
    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.get("/get/sale-document/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      document_id: zod.string().transform((val) => parseInt(val)),
    });
    const query = queryValidator.parse(req.query);

    const saleDocument = await saleDocumentModel.findByPk(query.document_id, {
      include: [
        {
          model: saleDocumentProductModel,
          required: false,
        },
      ],
    });

    res.send(saleDocument);
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.get("/get/sale-documents/", async (_, res) => {
  try {
    const saleDocuments = await saleDocumentModel.findAll({
      order: [["updatedAt", "DESC"]],
    });

    res.send(saleDocuments);
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.post("/create/sale-document/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const bodyValidator = zod.object({
      isPosted: zod.boolean(),
      products: zod.array(
        object({
          product_id: number(),
          name: zod.string(),
          quantity: zod.number(),
          price: number(),
        })
      ),
    });

    const body = bodyValidator.parse(req.body);
    const saleDocument = await saleDocumentModel.create({
      isPosted: body.isPosted,
    });
    const saleDocumentId = parseInt(saleDocument.document_id.toString());
    const quantities = await countProductQuantity({
      products: body.products,
    });

    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i];

      if (quantities[product.product_id] - product.quantity < 0) {
        throw `Недостатньо товару ${product.name} ${Math.abs(
          quantities[product.product_id] - product.quantity
        )}`;
      }
      await saleDocumentProductModel.create({
        document_id: saleDocumentId,
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      });
    }
    transaction.commit();

    res.send({ ok: true, document: saleDocument });
  } catch (error) {
    console.error(error);
    transaction.rollback();

    res.send({ ok: false, msg: error?.toString() });
  }
});

app.patch("/update/sale-document/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const queryValidator = zod.object({
      document_id: zod.string().transform((val) => parseInt(val)),
    });
    const bodyValidator = zod.object({
      isPosted: zod.boolean(),
      products: zod.array(
        object({
          product_id: number(),
          name: zod.string(),
          quantity: zod.number(),
          price: number(),
        })
      ),
    });
    const body = bodyValidator.parse(req.body);
    const query = queryValidator.parse(req.query);

    await saleDocumentModel.update(
      { isPosted: body.isPosted },
      {
        where: {
          document_id: query.document_id,
        },
      }
    );

    const prevProducts =
      (
        await saleDocumentModel.findByPk(query.document_id, {
          include: [
            {
              model: saleDocumentProductModel,
            },
          ],
        })
      )?.products || [];
    const quantities = await countProductQuantity({
      products: body.products,
    });

    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i];
      const productQuantity = body.products
        .filter((el) => el.product_id === product.product_id)
        .reduce((state, val) => state + val.quantity, 0);
      const prevProductQuantity = prevProducts
        .filter((el) => el.product_id === product.product_id)
        .reduce((state, val) => state + val.quantity, 0);
      console.log(
        productQuantity,
        prevProductQuantity,
        quantities[product.product_id]
      );
      if (
        quantities[product.product_id] + prevProductQuantity - productQuantity <
        0
      ) {
        throw `Недостатньо товару ${product.name} ${Math.abs(
          quantities[product.product_id] + prevProductQuantity - productQuantity
        )} `;
      }
    }
    await saleDocumentProductModel.destroy({
      where: {
        document_id: query.document_id,
      },
    });
    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i];
      await saleDocumentProductModel.create({
        document_id: query.document_id,
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      });
    }
    transaction.commit();

    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    transaction.rollback();

    res.status(400).send({ ok: false, msg: error?.toString() });
  }
});

app.get("/get/income-document/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      document_id: zod.string(),
    });
    const { document_id } = queryValidator.parse(req.query);

    const document = await incomeDocumentModel.findByPk(document_id, {
      include: [
        {
          model: incomeDocumentProductModel,

          required: false,
        },
      ],
    });

    res.send(document);
  } catch (error) {
    console.error(error);
    res.send({});
  }
});

app.get("/get/income-documents/", async (_, res) => {
  try {
    const documents = await incomeDocumentModel.findAll();
    res.send(documents);
  } catch (error) {
    console.error(error);
    res.send([]);
  }
});

app.post("/create/income-document/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const bodyValidator = zod.object({
      isPosted: zod.boolean(),
      products: zod.array(
        zod.object({
          product_id: zod.number().min(1),
          name: zod.string().min(1),
          price: zod.number().min(1),
          quantity: zod.number().nonnegative(),
        })
      ),
    });
    const body = bodyValidator.parse(req.body);

    const newIncomeDocument = await incomeDocumentModel.create({
      isPosted: body.isPosted,
    });

    const newIncomeDocumentId = parseInt(
      newIncomeDocument.dataValues.document_id.toString()
    );

    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i];
      await incomeDocumentProductModel.create({
        document_id: newIncomeDocumentId,
        name: product.name,
        product_id: product.product_id,
        price: product.price,
        quantity: product.quantity,
      });
    }
    transaction.commit();
    res.send(newIncomeDocument.dataValues);
  } catch (error) {
    console.error(error);
    transaction.rollback();
    res.status(400).send({ ok: false });
  }
});
app.patch("/update/income-document/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const queryValidator = zod.object({
      document_id: zod.string().transform((val) => parseInt(val)),
    });
    const bodyValidator = zod.object({
      isPosted: zod.boolean(),
      products: zod.array(
        zod.object({
          product_id: zod.number().min(1),
          name: zod.string().min(1),
          price: zod.number().min(1),
          quantity: zod.number().nonnegative(),
        })
      ),
    });
    const query = queryValidator.parse(req.query);
    const body = bodyValidator.parse(req.body);

    await incomeDocumentModel.update(
      { isPosted: body.isPosted },
      {
        where: {
          document_id: query.document_id,
        },
      }
    );
    await incomeDocumentProductModel.destroy({
      where: {
        document_id: query.document_id,
      },
    });

    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i];
      await incomeDocumentProductModel.create({
        document_id: query.document_id,
        name: product.name,
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price,
      });
    }
    transaction.commit();
    res.send({ ok: true });
  } catch (error) {
    console.error(error);

    transaction.rollback();
    res.status(400).send({ ok: false });
  }
});

app.listen({ host: "0.0.0.0", port: 1337 }).then(async () => {
  console.log("server works on http://localhost:1337");
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await sequelize.query("PRAGMA foreign_keys = ON;");
    await sequelize.query("PRAGMA journal_mode = WAL;");
    await sequelize.query("PRAGMA temp_store = memory;");
    await sequelize.query("PRAGMA mmap_size = 30000000000;");
    await sequelize.query("PRAGMA synchronous = normal;");
    await sequelize.query("PRAGMA vacuum;");
    await sequelize.query("PRAGMA optimize;");

    console.log("db works too");
  } catch (error) {
    console.error(error);
  }
});
