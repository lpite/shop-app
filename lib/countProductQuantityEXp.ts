import getDb from "./db";

type CountProductQuantityExp = {
	products: { product_id: number, quantity: number }[]
	exept?: number;
	exeptType?: "sale" | "income";
}

export default async function countProductQuantityExp({
	products,
	exept,
	exeptType
}: CountProductQuantityExp) {
	if (!products.length) {
		return {}
	}
	const db = await getDb();
	let query = `(product.product_id = ${products[0].product_id}`
	if (products.length > 1) {
		products.slice(1).forEach((num) => {
			query += ` OR product.product_id = ${num.product_id}`
		})	
	}
	const saleProducts = await db.all(`SELECT product.product_id,
									SUM(sale_document_product.quantity) as quantity
									FROM product 
										LEFT JOIN sale_document_product
										ON sale_document_product.product_id = product.product_id
										LEFT JOIN sale_document
										ON sale_document.document_id = sale_document_product.document_id
									WHERE 
									${exeptType === "sale" ? "sale_document_product.document_id != " + exept + " AND" : ""}
									${query})
									AND sale_document.isPosted = 1
									GROUP BY product.product_id`)
	
	const incomeProducts = await db.all(`SELECT product.product_id,
									SUM(income_document_product.quantity) as quantity
									FROM product 
										LEFT JOIN income_document_product
										ON income_document_product.product_id = product.product_id
										LEFT JOIN income_document
										ON income_document.document_id = income_document_product.document_id
									WHERE 
									${exeptType === "income" ? "income_document_product.document_id != " + exept + "AND" : ""}
									${query})
									AND income_document.isPosted = 1
									GROUP BY product.product_id`)	
	console.log()
	console.log(saleProducts, incomeProducts)
	const productsLength = products.length;
	let quantities: { [key: string]: number } = {};

	for (let i = 0; i < productsLength; i++) {
		const {
			product_id
		} = products[i];
		const saleQuantity = saleProducts.find(el => el.product_id === product_id)?.quantity || 0;
		const incomeQuantity = incomeProducts.find(el => el.product_id === product_id)?.quantity || 0;
		const quantity = (incomeQuantity - saleQuantity) || 0
		quantities[product_id] = quantity;
	}


	return quantities
}
