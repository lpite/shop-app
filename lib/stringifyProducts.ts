export default function stringifyProducts(products: any) {
	return JSON.stringify(products.map((product:any) => ({
		pid: product.product_id,
		q: product.quantity,
		pr: product.price
	})));
}

