import { useParams } from "@solidjs/router"
import { createSignal, onMount } from "solid-js"
import { API_URL } from "../config/config"

export default function ProductPage() {
	const [product,setProduct] = createSignal({name:"",product_id:0})
	const params = useParams()
	onMount(async()=>{
		const prod = await fetch(`${API_URL}/get/product/?product_id=${params.productId}`).then(res=>res.json()).catch(err=>{})
		setProduct(prod)
	})
	return (
		<main>
			<h1>Товар {product().name}</h1>
			<h1>id {product().product_id}</h1>

		</main>
	)
}