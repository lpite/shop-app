import { useNavigate, useParams } from "@solidjs/router"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@suid/material";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import { createSignal, For, onMount } from "solid-js";
import ProductRow from "../components/ProductRow/ProductRow";
import { API_URL } from "../config/config";

type Product = {
	product_id: number,
	name: string,
	price: number,
	quantity: number
}

export default function SelectProducts() {
	const [products, setProducts] = createSignal<Product[]>([])
	const [selectedProducts, setSelectedProducts] = createSignal<Product[]>([])


	const params = useParams();
	const navigate = useNavigate();

	onMount(async () => {
		const prods = await fetch(`${API_URL}/get/products/`).then(res => res.json()).catch(err => [])
		setProducts(prods)
	})

	function selectProduct({
		name, price, product_id, quantity
	}: Product) {
		const product = selectedProducts().find(prod => prod.product_id === product_id)
		setSelectedProducts([...selectedProducts()])
		if (product) {
			setSelectedProducts(selectedProducts().map(prod => {
				if (prod.product_id === product_id) {
					return ({ ...prod, quantity: prod.quantity + 1 })
				}
				return prod
			}));
		} else {
			setSelectedProducts([...selectedProducts(), { product_id, name, price, quantity: 1, isNew: true }]);
		}
		sessionStorage.setItem("selectedProducts", JSON.stringify(selectedProducts()))
	}
	function removeSelectedProduct(product_id: number) {
		setSelectedProducts(selectedProducts().filter(el => el.product_id !== product_id))
	}

	return (
		<main>
			<button onClick={() => navigate(-1)}>Додати в документ</button>
			<Box sx={{ overflowY: "scroll", maxHeight: "60vh" }}>
				<Table sx={{ width: "95%", margin: "0 auto", }} size="small" stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell align="left">
								id
							</TableCell>
							<TableCell align="left">
								name
							</TableCell>
							<TableCell align="right">
								price
							</TableCell>
							<TableCell align="center">
								quantity
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody >
						<For each={products()}>
							{({
								name, product_id, price, quantity
							}) => (
								<TableRow onDblClick={() => selectProduct({ name, product_id, price, quantity })}>
									<TableCell align="left">
										{product_id}
									</TableCell>
									<TableCell align="left">
										{name}
									</TableCell>
									<TableCell align="right">
										{price}
									</TableCell>
									<TableCell align="center">
										{quantity}
									</TableCell>
								</TableRow>
							)}
						</For>
					
					</TableBody>
				</Table>
			</Box>

			<Box sx={{ bottom: 0, width: "100%", height: 250, overflowY: "scroll", borderTop: "2px solid black" }} backgroundColor="white">
				
				<Table sx={{ width: "95%", margin: "0 auto" }} size="small" stickyHeader>
					<TableHead>
						<TableRow sx={{ height: 30 }}>
							<TableCell align="left">
								id
							</TableCell>
							<TableCell align="left">
								name
							</TableCell>
							<TableCell align="right">
								price
							</TableCell>
							<TableCell align="center">
								quantity
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<For each={selectedProducts()}>
							{({
								name, product_id, price, quantity
							}) => (
								<ProductRow 
									product_id={product_id} 
									name={name} 
									price={price} 
									quantity={quantity}
									contextMenuItems={
										<>
											<Button 
												variant="contained" 
												size="small" 
												color="error"
												onClick={() => removeSelectedProduct(product_id)}
											>
												Видалити
											</Button>
										</>
									}
								/>
							)}
						</For>
					
					</TableBody>
				</Table>
			</Box>
		</main>)
}