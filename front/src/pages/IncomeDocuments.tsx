import { useNavigate } from "@solidjs/router"
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from "@suid/material"
import { createSignal, For, onMount } from "solid-js"
import { API_URL } from "../config/config"

export default function IncomeDocuments() {
	const [documents, setDocuments] = createSignal<any[]>([])

	const navigate = useNavigate()

	onMount(async () => {
		const docs = await fetch(`${API_URL}/get/income-documents/`).then(res => res.json()).catch(err => [])
		setDocuments(docs)
	})

	function openIncomeDocument(document_id: number|string) {
		navigate(`/income/${document_id}`)
	}

	return (
		<main class="page">
			<h1>Надходження</h1>
			<Button onClick={()=>openIncomeDocument("new")} variant="contained">Новий</Button>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell align="left">
							isPosted
						</TableCell>
						<TableCell align="left">
							id
						</TableCell>
						<TableCell align="left">
							time
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					<For each={documents()}>
						{(doc) => (
							<TableRow onDblClick={() => openIncomeDocument(doc.document_id)} sx={{ userSelect: "none" }}>

								<TableCell align="left">{doc.isPosted ? "Проведено" : "Не Проведено"}</TableCell>
								<TableCell align="left">{doc.document_id}</TableCell>
								<TableCell align="left">{(new Date(doc.time)).toLocaleString()}</TableCell>

							</TableRow>
						)}
					</For>
				</TableBody>
			</Table>
		</main>
	)
}