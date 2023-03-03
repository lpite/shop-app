import { IncomeDocument } from "types/incomeDocument";
import getDb from "./db";
import prettifyProducts from "./prettifyProducts";

export default async function countProductQuantity(productId: number, time: number, exept: number = 0) {
	const time1 = Number(new Date())

	const db = await getDb();
	const exeptDocumentString = exept ? `AND document_id != ${exept}` : ""
	// const cache = await db.run(``)

	const saleDocuments = await db.all(`SELECT products FROM sale_document WHERE products LIKE '%{"pid":${productId},%' AND isPosted = 1 ${exeptDocumentString}`)
	console.log("sale find", Number(new Date()) - time1)
	const incomeDocuments: IncomeDocument[] = await db.all(`SELECT products FROM income_document WHERE products LIKE '%{"pid":${productId},%' AND isPosted = 1 ${exeptDocumentString}`)
	console.log("income find", Number(new Date()) - time1)

	let quantity = 0;
	for (let i = 0; i < saleDocuments.length; i++) {
		const prettyProducts = prettifyProducts(saleDocuments[i].products);
		const products = prettyProducts.filter((product: any) => product?.product_id === productId) as any[]
		products.forEach((product) => {
			quantity -= product?.quantity;
		})
	}
	console.log("count sale", Number(new Date()) - time1)
	const incomeLength = incomeDocuments.length 
	for (let i = 0; i < incomeLength; i++) {
		const prettyProducts = prettifyProducts(incomeDocuments[i].products);
		for (let i = 0; i < prettyProducts.length; i++) {
			if (prettyProducts[i].product_id === productId) {
				quantity += prettyProducts[i]?.quantity;
			}
		}
	}
	console.log("count income", Number(new Date()) - time1)


	return quantity
}

export async function updateProductQuantity(productId: number) {
	const db = await getDb();

	const saleDocuments = await db.all(`SELECT * FROM sale_document WHERE products LIKE '%"product_id":${productId}%' AND isPosted = 1`)
	const incomeDocuments = await db.all(`SELECT * FROM income_document WHERE products LIKE '%"product_id":${productId}%' AND isPosted = 1`)

	let quantity = 0;
	for (let i = 0; i < saleDocuments.length; i++) {
		const saleDocument = saleDocuments[i];
		const prettyProducts = prettifyProducts(saleDocument.products);
		const products = prettyProducts.filter((product: any) => product?.product_id === productId) as any[]
		products.forEach((product) => {
			quantity -= product?.quantity;
		})
	}
	for (let i = 0; i < incomeDocuments.length; i++) {
		const incomeDocument = incomeDocuments[i];
		const prettyProducts = prettifyProducts(incomeDocument.products);
		const products = prettyProducts.filter((product: any) => product?.product_id === productId) as any[]
		products.forEach((product) => {
			quantity += product?.quantity;
		})
	}
	// db.run(``)
}