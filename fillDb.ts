import stringifyProducts from "./lib/stringifyProducts";
import getDb from "./lib/db";
import { getTimeInSeconds } from "./lib/getTime";

async function fillDb() {
	const db = await getDb();
	const leng = 500;
	const products = []
	for (let i = 0; i < 7386; i++) {
		const id = Math.floor(Math.random() * (7386 - 1 + 1) + 1)
		const q = Math.floor(Math.random() * (100 - 1 + 1) + 1)

		products.push({ product_id: i, quantity: q, price: 99 })
	}
	await db.exec("BEGIN TRANSACTION;")
	for (let i = 0; i < leng; i++) {

		const result = await db.run(`INSERT INTO income_document (time,isPosted) VALUES(${getTimeInSeconds()},?)`, true)
		for (let i = 0; i < products.length; i++) {
			const product = products[i]
			await db.run(`INSERT INTO income_document_product(document_id,product_id,quantity,price)
					VALUES(?,?,?,?)
				`, [result.lastID, product.product_id, product.quantity, product.price]).catch((errorMsg) => {
			})
		}
		if (leng - 1 === i) {
			await db.exec("COMMIT;")
			await db.close()
		}
	} 

	// await db.exec("BEGIN TRANSACTION;")
	// const str = stringifyProducts(products)
	// for (let i = 0; i < leng; i++) {
	// 	try {
	// 		await db.run(`INSERT INTO income_document (time,products,isPosted) VALUES(${getTimeInSeconds()},?,?)`, str, true)

	// 	} catch (e) {
	// 		console.error(e)
	// 	}
		
	// 	if (leng - 1 === i) {
	// 		await db.exec("COMMIT;")
	// 		await db.close()
	// 	}

	// } 
}
fillDb()