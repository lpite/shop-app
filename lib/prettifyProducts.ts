export default function prettifyProducts(productsString: any) {
	// const arr = JSON.parse(productsString);
	// for(let i=0;arr.length<i;i++){
	// 	arr[i] = {
	// 		ar
	// 	}
	// } 
	return JSON.parse(productsString).map((product: any) => {
		return ({
			product_id: product.pid,
			quantity: product.q,
			price: product.pr
		})
	})
}