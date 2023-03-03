import { A, useNavigate } from "@solidjs/router"
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Modal, TextField } from "@suid/material"
import { createSignal, For, JSX, onMount } from "solid-js"
import { API_URL } from "../config/config"

export default function Nomenclature() {
	const [products, setProducts] = createSignal<any[]>([])
	const [product, setProduct] = createSignal({ name: "" })
	const [isFetching, setIsFetching] = createSignal(false)
	const [openModal, setOpenModal] = createSignal(false);
	const navigate = useNavigate()

	onMount(async () => {
		const prods = await fetch(`${API_URL}/get/products/`).then(res => res.json()).catch(err => [])
		setProducts(prods)
	})

	async function saveProduct() {
		const headers = new Headers({
			"Content-Type": "application/json"
		})
		await fetch(`${API_URL}/create/product/`, {
			method: "POST",
			body: JSON.stringify(product()),
			headers: headers
		})
	}
	function openProduct(product_id: number) {
		navigate(`/product/${product_id}`)
	}
	const onScroll: JSX.EventHandlerUnion<HTMLDivElement, UIEvent> = async (e) => {
		if (!isFetching()) {
			if (e.currentTarget.scrollHeight / 2 - 600 < e.currentTarget.scrollTop) {
				setIsFetching(true)
				const prods = await fetch(`${API_URL}/get/products/?skip=${products().length}`).then(res => res.json()).catch(err => [])
				setProducts([...products(), ...prods])
				setIsFetching(false)
			}	
		} else {
		}
		
	}
	return (
		<main style={{ height: "85%" }}>
			<h1>Номенклатура</h1>
			<div>
				<Button onClick={() => setOpenModal(true)} variant="contained">Створити</Button>
				<Modal open={openModal()} onClose={() => setOpenModal(false)}>
					<Box sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: 400,
						backgroundColor: "white",
						border: "2px solid #000",
						boxShadow: "24px",
						p: 4,
					}}>
						<TextField 
							value={product().name} 
							onChange={(event, value) => setProduct({ ...product(), name: value })} 
							variant="outlined" 
							label="Назва товару" />	
						<Button onClick={saveProduct}>
							Зберегти
						</Button>		
					</Box>
				</Modal>
			</div>
			<Box onScroll={onScroll} sx={{ height: "90%", overflowY: "scroll" }}>
				<Table size="small" stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell>id</TableCell>
							<TableCell>name</TableCell>
							<TableCell>price</TableCell>
							<TableCell>quantity</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<For each={products()}>
							{(prod) => (
								<TableRow onClick={() => openProduct(prod.product_id)}>
									<TableCell>{prod.product_id}</TableCell>
									<TableCell>{prod.name}</TableCell>
									<TableCell>{prod.price}</TableCell>
									<TableCell>{prod.quantity}</TableCell>
								</TableRow>
							)}
						</For>
					</TableBody>
				</Table>
			</Box>
			
			
		</main>
	)
}