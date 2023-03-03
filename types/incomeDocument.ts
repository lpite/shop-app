
export type IncomeDocument = {
	document_id: number,
	time: number,
	isPosted: boolean,
	products: IncomeDocumentProduct[]| string
}

export type IncomeDocumentProduct = {
	product_id: number,
	quantity: number,
	price: number
}