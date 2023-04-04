import { useNavigate } from "@solidjs/router";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
} from "@suid/material";
import { createSignal, For, onMount } from "solid-js";
import { API_URL } from "../config/config";

export default function SaleDocuments() {
  const [documents, setDocuments] = createSignal<any[]>([]);

  const navigate = useNavigate();

  onMount(async () => {
    const docs = await fetch(`${API_URL}/get/sale-documents/`)
      .then((res) => res.json())
      .catch((err) => []);
    setDocuments(docs);
  });

  function openSaleDocument(document_id: number | string) {
    navigate(`/sale/${document_id}`);
  }

  return (
    <main class="page">
      <h1>Продаж</h1>
      <Button onClick={() => openSaleDocument("new")} variant="contained">
        Новий
      </Button>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left">isPosted</TableCell>
            <TableCell align="left">id</TableCell>
            <TableCell align="left">time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={documents()}>
            {(doc) => (
              <TableRow
                onDblClick={() => openSaleDocument(doc.document_id)}
                sx={{ userSelect: "none" }}
              >
                <TableCell align="left">
                  {doc.isPosted ? "Проведено" : "Не Проведено"}
                </TableCell>
                <TableCell align="left">{doc.document_id}</TableCell>
                <TableCell align="left">
                  {new Date(doc.time).toLocaleString()}
                </TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </main>
  );
}
