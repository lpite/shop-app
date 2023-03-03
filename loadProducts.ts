import getDb from "./lib/db";
import fs from "fs"
async function loadProducts() {
	const pord = fs.readFileSync("./prod.txt").toString()
	const db = await getDb()
	const products = pord.split("\r\n");
	await db.exec("BEGIN TRANSACTION;")
	for (let i = 0; i < products.length; i++) {
		const product = products[i];
	console.log(product.split("\t")[1])

		try {
			const result = await db.run("INSERT INTO product (name) VALUES(?)", [product.split("\t")[1]])
			await db.run("INSERT INTO price (product_id,price) VALUES(?,?)", [result.lastID, product.split("\t")[3]])

		} catch (e) {
			console.error(e)
			console.log("tovar"+product)
		}
		
		if (products.length - 1 === i) {
			await db.exec("COMMIT;")
			await db.close()
		}

	} 
}

loadProducts()