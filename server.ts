import fastify from "fastify";
import cors from "@fastify/cors";

import path from "path";

import { getTimeInSeconds } from "./lib/getTime";
import getDb from "./lib/db";
import countProductQuantity from "./lib/countProductQuantity";
import prettifyProducts from "./lib/prettifyProducts";
import stringifyProducts from "./lib/stringifyProducts";

import { Product } from "types/product";
import { IncomeDocument } from "types/incomeDocument";
import countProductQuantityExp from "./lib/countProductQuantityEXp";

const app = fastify();

app.register(cors, {
  // put your options here
});
app.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public')
})

app.get("/get/product/", async (req, res) => {
  try {
    /*
	---- query ---- 
	time час на який показувати наявність товару
	searchCode або id

	Повертає 
	{
		id:string,
		name:string,
		price:number,
		quantity:number
	}
*/

    const query = req.query as any;
    const db = await getDb();
    const product: any = await db.get(
      `SELECT name,product.product_id,price FROM product LEFT JOIN price ON price.product_id=product.product_id WHERE product.product_id = ?`,
      [query.product_id]
    );

    const productQuantity = await countProductQuantity(product.product_id, 0);

    res.send({ ...product, quantity: productQuantity });
  } catch (error) {
    console.error(error);
    res.send({});
  }
});

app.get("/get/products/", async (req, res) => {
  try {
    const db = await getDb();
    const query = req.query as { skip: string };
    const products = await db.all(
      `SELECT product.product_id,price.price,name
									FROM product 
									LEFT JOIN price ON price.product_id=product.product_id 
									GROUP BY product.product_id LIMIT 50 OFFSET ?`,
      [query.skip || 0]
    );
    const quantities = await countProductQuantityExp({ products: products });
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      products[i] = {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: quantities[product.product_id],
        // quantity: product.income_quantity - product.sale_quantity
      };
    }
    res.send(products);
  } catch (error) {
    console.error(error);
    res.send([]);
  }
});

app.post("/create/product/", async (req, res) => {
  try {
    const db = await getDb();

    const body = req.body as any;
    console.log(body);
    await db.run(`INSERT INTO product(name) VALUES(?);`, body.name);

    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.post("/create/price/", async (req, res) => {
  try {
    const db = await getDb();

    const body = req.body as any;
	console.log(body)
    if (!body.productId) {
      throw new Error("Немає айді товару");
    }
    await db.run(
      `INSERT INTO price(product_id,price) VALUES(?,?);`,
      body.productId,
      body.price
    );

    res.send({ ok: true });
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.get("/get/sale-document/", async (req, res) => {
  try {
    const db = await getDb();
    const query = req.query as any;
    if (!query.document_id) {
      throw new Error("Немає айді документу");
    }
    const saleDocument = await db.get(
      `SELECT * FROM sale_document WHERE document_id = ?`,
      [query.document_id]
    );
    const saleDocumentProducts = await db.all(
      `SELECT 
							product.product_id,
							product.name,
							document_product.price,
							document_product.quantity
						FROM sale_document_product document_product
								LEFT JOIN product 
								ON document_product.product_id = product.product_id
						WHERE document_product.document_id = ?;`,
      [query.document_id]
    );

    saleDocument.products = saleDocumentProducts;
    saleDocument.isPosted = Boolean(saleDocument.isPosted);

    res.send(saleDocument);
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.get("/get/sale-documents/", async (_, res) => {
  try {
    const db = await getDb();

    const saleDocuments = await db.all(
      `SELECT * FROM sale_document ORDER BY time DESC LIMIT 100;`
    );

    res.send(saleDocuments);
  } catch (error) {
    console.error(error);
    res.send({ ok: false });
  }
});

app.post("/create/sale-document/", async (req, res) => {
  try {
    const db = await getDb();

    const body = req.body as any;

    if (typeof body.isPosted !== "boolean") {
      throw new Error("isPosted в неправильному форматі");
    }

    if (typeof body.products !== "object") {
      throw new Error("products в неправильному форматі");
    }

    if (body.isPosted === true && !body.products.length) {
      return res.status(400).send({ msg: "Немає товарів" });
    }
    let newProducts: Product[] = body.products;
    let outOfStock = false;
    const productsQuantity: { [key: string]: number } = {};

    const quantities = await countProductQuantityExp({
      products: body.products,
    });

    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i] as Product;
      productsQuantity[product.product_id] =
        (productsQuantity[product.product_id] || 0) + product.quantity;
    }

    for (let i = 0; i < Object.keys(productsQuantity).length; i++) {
      const [product_id, quantity] = Object.entries(productsQuantity)[i];
      if (quantities[product_id] - quantity < 0) {
        outOfStock = true;
        newProducts = newProducts.map((prod) => {
          if (prod.product_id === Number(product_id)) {
            return { ...prod, serverQuantity: quantities[product_id] };
          }
          return prod;
        });
      }
    }

    if (outOfStock) {
      return res.send({ status: "outOfStock", outOfStock: newProducts });
    }
    let error = false;
    await db.exec("BEGIN TRANSACTION;");
    const result = await db.run(
      `INSERT INTO sale_document (time,isPosted) VALUES(${getTimeInSeconds()},?)`,
      body.isPosted
    );

    for (let i = 0; i < body.products.length; i++) {
      const { product_id, quantity, price } = body.products[i];
      await db.run(
        `INSERT INTO sale_document_product (document_id,product_id,quantity,price) 
							VALUES(?,?,?,?)
				`,
        [result.lastID, product_id, quantity, price]
      );
    }
    if (error) {
      await db.exec("ROLLBACK;");
      throw new Error("?");
    } else {
      await db.exec("COMMIT");
    }
    // const productsString = stringifyProducts(body.products)
    const saleDocument = await db.get(
      "SELECT * FROM sale_document WHERE document_id = ?",
      [result.lastID]
    );
    res.send(saleDocument);
  } catch (error) {
    console.error(error);
    res.status(400).send({ msg: "Помилка!" });
  }
});

app.patch("/update/sale-document/", async (req, res) => {
  /*
		query
		document_id айді документу який потірбно оновити
	
		body документ
	*/
  try {
    const db = await getDb();
    const body = req.body as any;
    const query = req.query as any;
    let newProducts: Product[] = body.products;
    let outOfStock = false;
    const productsQuantity: { [key: string]: number } = {};

    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i] as Product;
      productsQuantity[product.product_id] =
        (productsQuantity[product.product_id] || 0) + product.quantity;
    }
    const quantities = await countProductQuantityExp({
      products: body.products,
      exept: Number(query.document_id),
      exeptType: "sale",
    });
    //console.log(quantities, productsQuantity)
    for (let i = 0; i < Object.keys(productsQuantity).length; i++) {
      const [product_id, quantity] = Object.entries(productsQuantity)[i];
      if (quantities[product_id] - quantity < 0) {
        outOfStock = true;
        newProducts = newProducts.map((prod) => {
          if (prod.product_id === Number(product_id)) {
            return { ...prod, serverQuantity: quantities[product_id] };
          }
          return prod;
        });
      }
    }
    if (outOfStock) {
      return res.send({ status: "outOfStock", outOfStock: newProducts });
    }
    let error = false;
    await db.exec("BEGIN TRANSACTION;");
    await db.run(
      `UPDATE sale_document SET isPosted = ? WHERE document_id = ?`,
      body.isPosted,
      query.document_id
    );
    await db.run(`DELETE FROM sale_document_product WHERE document_id = ?`, [
      query.document_id,
    ]);
    for (let i = 0; i < body.products.length; i++) {
      const { product_id, quantity, price } = body.products[i];
      await db
        .run(
          `INSERT INTO sale_document_product (document_id,product_id,quantity,price) 
							VALUES(?,?,?,?)
				`,
          [query.document_id, product_id, quantity, price]
        )
        .catch((err) => {
          error = true;

          console.log(err?.errno);
        });
    }
    if (error) {
      await db.exec("ROLLBACK;");
      return res.status(400).send({ msg: "Якась помилочка" });
    } else {
      await db.exec("COMMIT");
    }

    res.send({ ok: true });
  } catch (error) {
    console.error(error);

    res.status(400).send({ msg: "Якась помилочка" });
  }
});

app.get("/get/income-document/", async (req, res) => {
  try {
    const db = await getDb();
    const query = req.query as { document_id: string };
    if (!query.document_id) {
      throw new Error("Немає айді документу");
    }

    const incomeDocument: IncomeDocument | undefined = await db.get(
      `SELECT * FROM income_document WHERE income_document.document_id = ?`,
      [query.document_id]
    );
    if (incomeDocument === undefined) {
      throw new Error("Такого документу немає");
    }
    const IncomeDocumentProducts = await db.all(
      `SELECT 
							product.product_id,
							product.name,
							document_product.price,
							document_product.quantity
						FROM income_document_product document_product
								LEFT JOIN product 
								ON document_product.product_id = product.product_id
						WHERE document_product.document_id = ?;`,
      [query.document_id]
    );

    incomeDocument.products = IncomeDocumentProducts;
    incomeDocument.isPosted = Boolean(incomeDocument.isPosted);

    res.send(incomeDocument);
  } catch (error) {
    console.error(error);
    res.send({});
  }
});

app.get("/get/income-documents/", async (_, res) => {
  try {
    const db = await getDb();

    const incomeDocuments: IncomeDocument[] = await db.all(
      `SELECT isPosted,time,document_id FROM income_document ORDER BY time DESC LIMIT 50;`
    );

    res.send(incomeDocuments);
  } catch (error) {
    console.error(error);
    res.send([]);
  }
});

app.post("/create/income-document/", async (req, res) => {
  try {
    const db = await getDb();

    const body = req.body as IncomeDocument;

    if (typeof body.isPosted !== "boolean") {
      throw new Error("isPosted в неправильному форматі");
    }

    if (typeof body.products !== "object") {
      throw new Error("products в неправильному форматі");
    }
    await db.exec("BEGIN TRANSACTION;");

    const result = await db.run(
      `INSERT INTO income_document (time,isPosted) VALUES(${getTimeInSeconds()},?)`,
      body.isPosted
    );
    let error = false;
    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i];
      await db
        .run(
          `INSERT INTO income_document_product(document_id,product_id,quantity,price)
					VALUES(?,?,?,?)
				`,
          [result.lastID, product.product_id, product.quantity, product.price]
        )
        .catch((errorMsg) => {
          console.error(errorMsg);
          error = true;
        });
    }
    if (error) {
      await db.exec("ROLLBACK;");
      throw new Error("Помилка");
    } else {
      await db.exec("COMMIT;");
    }
    const incomeDocument = await db.get(
      "SELECT * FROM income_document WHERE document_id = ?",
      [result.lastID]
    );

    res.send(incomeDocument);
  } catch (error) {
    console.error(error);
    res.status(400).send({ ok: false });
  }
});
app.patch("/update/income-document/", async (req, res) => {
  try {
    const db = await getDb();
    const body = req.body as IncomeDocument;
    const query = req.query as any;

    if (typeof body.isPosted !== "boolean") {
      throw new Error("isPosted в неправильному форматі");
    }

    if (typeof body.products !== "object") {
      throw new Error("products в неправильному форматі");
    }
    let error = false;

    await db.exec("BEGIN TRANSACTION;");

    await db.run(
      `UPDATE income_document SET isPosted = ? WHERE document_id = ?`,
      [body.isPosted, query.document_id]
    );

    await db.run(`DELETE FROM income_document_product WHERE document_id = ?`, [
      query.document_id,
    ]);

    for (let i = 0; i < body.products.length; i++) {
      const product = body.products[i];
      await db
        .run(
          `INSERT INTO income_document_product(document_id,product_id,quantity,price)
					VALUES(?,?,?,?)
				`,
          [
            query.document_id,
            product.product_id,
            product.quantity,
            product.price,
          ]
        )
        .catch((errorMsg) => {
          console.error(errorMsg);
          error = true;
        });
    }
    if (error) {
      await db.exec("ROLLBACK;");
      throw new Error("smth wrong");
    } else {
      await db.exec("COMMIT;");
    }

    res.send({ ok: true });
  } catch (error) {
    res.status(400).send({ ok: false });
  }
});

app.listen({ host: "0.0.0.0", port: 1337 }).then(async () => {
  console.log("server works on http://localhost:1337");
  try {
    const db = await getDb();
    // db.exec("DROP TABLE IF EXISTS product;")
    // db.exec("DROP TABLE IF EXISTS price;")

    await db.exec(`
			CREATE TABLE IF NOT EXISTS product (
			product_id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		);`);
    await db.exec(`CREATE TABLE IF NOT EXISTS price (
			price_id INTEGER PRIMARY KEY AUTOINCREMENT,
			product_id INTEGER NOT NULL UNIQUE,
			price REAL NOT NULL,
			FOREIGN KEY (product_id)
       			REFERENCES product (product_id) 
		);`);
    await db.exec(`CREATE TABLE IF NOT EXISTS sale_document (
			document_id INTEGER PRIMARY KEY AUTOINCREMENT,
			time INTEGER NOT NULL,
			isPosted INTEGER NOT NULL
		);`);
    await db.exec(`CREATE TABLE IF NOT EXISTS sale_document_product (
			document_id INTEGER NOT NULL,
			product_id INTEGER NOT NULL,
			quantity REAL NOT NULL,
			price REAL NOT NULL,
			FOREIGN KEY (product_id)
       			REFERENCES product (product_id),
       		FOREIGN KEY (document_id)
       			REFERENCES sale_document (document_id)
		);`);
    await db.exec(`CREATE TABLE IF NOT EXISTS income_document (
			document_id INTEGER PRIMARY KEY AUTOINCREMENT,
			time INTEGER NOT NULL,
			isPosted INTEGER NOT NULL
		);`);
    await db.exec(`CREATE TABLE IF NOT EXISTS income_document_product (
			document_id INTEGER NOT NULL,
			product_id INTEGER NOT NULL,
			quantity REAL NOT NULL,
			price REAL NOT NULL,
			FOREIGN KEY (product_id)
       			REFERENCES product (product_id),
       		FOREIGN KEY (document_id)
       			REFERENCES income_document (document_id)
		);`);
    await db.exec(`CREATE TABLE IF NOT EXISTS quantity (
			product_id INTEGER NOT NULL UNIQUE,
			quantity REAL NOT NULL,
			FOREIGN KEY (product_id)
       			REFERENCES product (product_id)
		);`);
    console.log("db works too");
  } catch (error) {
    console.error(error);
  }
});
