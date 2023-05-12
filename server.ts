import fastify from "fastify";
import cors from "@fastify/cors";
import { Op } from "sequelize";
import path from "path";

import { number, object, z as zod } from "zod";

import { sequelize } from "./lib/sequelize";

import { ProductModel, productModel } from "./models/product";
import { priceModel } from "./models/price";
import { saleDocumentModel } from "./models/saleDocument";
import { incomeDocumentModel } from "./models/incomeDocument";
import { documentProductModel } from "./models/documentProduct";

const app = fastify();

app.register(cors);
app.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
});

app.get("/test/", async (_, res) => {
  // const products =
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
    // const productQuantity = Object.values(
    //   await countProductQuantityExp({ products: [product] })
    // )[0];

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
    });
    // const quantities = await countProductQuantityExp({ products: products });
    // for (let i = 0; i < products.length; i++) {
    //   const product = products[i];
    //   products[i] = {
    //     product_id: product.product_id,
    //     name: product.name,
    //     price: product.price,
    //     quantity: quantities[product.product_id],
    //   };
    // }
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

app.get<{
  Querystring: { productId?: string };
  Reply?: number;
}>("/get/price/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      productId: zod.string().transform((val) => parseInt(val)),
    });
    const { productId } = queryValidator.parse(req.query);

    const price = await priceModel.findOne({
      where: {
        product_id: productId,
      },
    });
    res.send(price?.dataValues.price);
  } catch (error) {
    res.send(0);
  }
});

app.post<{
  Querystring: { productId?: string };
  Body: { price?: number };
  Reply: { ok: boolean };
}>("/create/price/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      productId: zod.string().transform((val) => parseInt(val)),
    });
    const bodyValidator = zod.object({
      price: zod.number(),
    });
    const { productId } = queryValidator.parse(req.query);
    const { price } = bodyValidator.parse(req.body);

    await priceModel.create({
      product_id: productId,
      price: price,
    });

    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.patch<{
  Querystring: { productId?: string };
  Body: { newPrice?: number };
}>("/update/price/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      productId: zod.string().transform((val) => parseInt(val)),
    });
    const bodyValidator = zod.object({
      newPrice: zod.number(),
    });
    const { productId } = queryValidator.parse(req.query);
    const { newPrice } = bodyValidator.parse(req.body);
    await priceModel.update(
      {
        price: newPrice,
      },
      {
        where: {
          product_id: productId,
        },
      }
    );
    res.send({ ok: true });
  } catch (error) {
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
      include: {
        model: documentProductModel,
        where: {
          document_type: {
            [Op.is]: "sale",
          },
        },
      },
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
  try {
    const bodyValidator = zod.object({
      isPosted: zod.boolean(),
      DocumentProducts: zod
        .array(
          object({
            product_id: number(),
            name: zod.string(),
            quantity: zod.number(),
            price: number(),
          })
        )
        .min(1),
    });

    const body = bodyValidator.parse(req.body);

    const saleDocument1 = await saleDocumentModel.create({
      isPosted: body.isPosted,
    });
    const saleDocument1Id = parseInt(saleDocument1.document_id.toString());
    for (let i = 0; i < body.DocumentProducts.length; i++) {
      const product = body.DocumentProducts[i];
      await documentProductModel.create({
        document_id: saleDocument1Id,
        document_type: "sale",
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      });
    }
    res.send({ ok: true, document: saleDocument1 });
    return;
    // let newProducts: Product[] = body.products;
    // let outOfStock = false;
    // const productsQuantity: { [key: string]: number } = {};

    // const quantities = await countProductQuantityExp({
    //   products: body.products,
    // });

    // for (let i = 0; i < body.products.length; i++) {
    //   const product = body.products[i] as Product;
    //   productsQuantity[product.product_id] =
    //     (productsQuantity[product.product_id] || 0) + product.quantity;
    // }

    // for (let i = 0; i < Object.keys(productsQuantity).length; i++) {
    //   const [product_id, quantity] = Object.entries(productsQuantity)[i];
    //   if (quantities[product_id] - quantity < 0) {
    //     outOfStock = true;
    //     newProducts = newProducts.map((prod) => {
    //       if (prod.product_id === Number(product_id)) {
    //         return { ...prod, serverQuantity: quantities[product_id] };
    //       }
    //       return prod;
    //     });
    //   }
    // }

    // if (outOfStock) {
    //   return res.send({
    //     ok: false,
    //     msg: "Недостатньо товарів",
    //     outOfStock: newProducts,
    //   });
    // }
    // let error = false;
    // await db.exec("BEGIN TRANSACTION;");
    // const result = await db.run(
    //   `INSERT INTO sale_document (time,isPosted) VALUES(${getTimeInSeconds()},?)`,
    //   body.isPosted
    // );

    // for (let i = 0; i < body.products.length; i++) {
    //   const { product_id, quantity, price } = body.products[i];
    //   await db.run(
    //     `INSERT INTO sale_document_product (document_id,product_id,quantity,price)
    // 					VALUES(?,?,?,?)
    // 		`,
    //     [result.lastID, product_id, quantity, price]
    //   );
    // }
    // if (error) {
    //   await db.exec("ROLLBACK;");
    //   throw new Error("?");
    // } else {
    //   await db.exec("COMMIT");
    // }
    // const saleDocument = await db.get(
    //   "SELECT * FROM sale_document WHERE document_id = ?",
    //   [result.lastID]
    // );
    // res.send({ ok: true, document: saleDocument });
  } catch (error) {
    console.error(error);
    res.status(400).send({ ok: false, msg: "Помилка!" });
  }
});

app.patch("/update/sale-document/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      document_id: zod.string(),
    });
    const bodyValidator = zod.object({
      isPosted:zod.boolean(),
      DocumentProducts: zod
        .array(
          object({
            product_id: number(),
            name: zod.string(),
            quantity: zod.number(),
            price: number(),
          })
        )
        .min(1),
    })
    const body = bodyValidator.parse(req.body);
    const query = queryValidator.parse(req.query)
    // const db = await getDb();
    // let newProducts: Product[] = body.products;
    // let outOfStock = false;
    // const productsQuantity: { [key: string]: number } = {};

    // for (let i = 0; i < body.products.length; i++) {
    //   const product = body.products[i] as Product;
    //   productsQuantity[product.product_id] =
    //     (productsQuantity[product.product_id] || 0) + product.quantity;
    // }
    // const quantities = await countProductQuantityExp({
    //   products: body.products,
    //   exept: Number(query.document_id),
    //   exeptType: "sale",
    // });
    // for (let i = 0; i < Object.keys(productsQuantity).length; i++) {
    //   const [product_id, quantity] = Object.entries(productsQuantity)[i];
    //   if (quantities[product_id] - quantity < 0) {
    //     outOfStock = true;
    //     newProducts = newProducts.map((prod) => {
    //       if (prod.product_id === Number(product_id)) {
    //         return { ...prod, serverQuantity: quantities[product_id] };
    //       }
    //       return prod;
    //     });
    //   }
    // }
    // if (outOfStock) {
    //   return res.send({
    //     ok: false,
    //     msg: "Недостатньо товарів",
    //     outOfStock: newProducts,
    //   });
    // }
    // let error = false;
    // await db.exec("BEGIN TRANSACTION;");
    // await db.run(
    //   `UPDATE sale_document SET isPosted = ? WHERE document_id = ?`,
    //   body.isPosted,
    //   query.document_id
    // );
    // await db.run(`DELETE FROM sale_document_product WHERE document_id = ?`, [
    //   query.document_id,
    // ]);
    // for (let i = 0; i < body.products.length; i++) {
    //   const { product_id, quantity, price } = body.products[i];
    //   await db
    //     .run(
    //       `INSERT INTO sale_document_product (document_id,product_id,quantity,price) 
		// 					VALUES(?,?,?,?)
		// 		`,
    //       [query.document_id, product_id, quantity, price]
    //     )
    //     .catch((err) => {
    //       error = true;

    //       console.log(err?.errno);
    //     });
    // }
    // if (error) {
    //   await db.exec("ROLLBACK;");
    //   return res.status(400).send({ ok: false, msg: "Якась помилочка" });
    // } else {
    //   await db.exec("COMMIT");
    // }

    res.send({ ok: true });
  } catch (error) {
    console.error(error);

    res.status(400).send({ ok: false, msg: "Якась помилочка" });
  }
});

app.get("/get/income-document/", async (req, res) => {
  try {
    const queryValidator = zod.object({
      document_id: zod.string(),
    });
    const { document_id } = queryValidator.parse(req.query);

    const document = await incomeDocumentModel.findByPk(document_id, {
      include: {
        model: documentProductModel,
        attributes: ["product_id", "name", "price", "quantity"],
        where: {
          document_type: {
            [Op.is]: "income",
          },
        },
      },
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
      DocumentProducts: zod.array(
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

    for (let i = 0; i < body.DocumentProducts.length; i++) {
      const product = body.DocumentProducts[i];
      await documentProductModel.create({
        document_id: newIncomeDocumentId,
        document_type: "income",
        name: product.name,
        product_id: product.product_id,
        price: product.price,
        quantity: product.quantity,
      });
    }

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
      DocumentProducts: zod.array(
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
    await documentProductModel.destroy({
      where: {
        document_id: query.document_id,
        document_type: "income",
      },
    });

    for (let i = 0; i < body.DocumentProducts.length; i++) {
      const product = body.DocumentProducts[i];
      await documentProductModel.create({
        document_id: query.document_id,
        document_type: "income",
        name: product.name,
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price,
      });
    }

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
    // await sequelize.sync({ force: true });

    productModel.hasOne(priceModel, {
      foreignKey: "product_id",
    });
    priceModel.belongsTo(productModel, {
      foreignKey: "product_id",
    });

    saleDocumentModel.hasMany(documentProductModel, {
      foreignKey: "document_id",
    });

    documentProductModel.belongsTo(saleDocumentModel, {
      foreignKey: "document_id",
    });
    incomeDocumentModel.hasMany(documentProductModel, {
      foreignKey: "document_id",
    });
    documentProductModel.belongsTo(incomeDocumentModel, {
      foreignKey: "document_id",
    });
    await sequelize.query("PRAGMA foreign_keys = ON;");
    await sequelize.query("PRAGMA journal_mode = WAL;");
    await sequelize.query("PRAGMA temp_store = memory;");
    await sequelize.query("PRAGMA mmap_size = 30000000000;")
    await sequelize.query("PRAGMA synchronous = normal;");
    await sequelize.query("PRAGMA vacuum;");
    await sequelize.query("PRAGMA optimize;");


    console.log("db works too");
  } catch (error) {
    console.error(error);
  }
});
