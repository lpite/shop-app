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
import getAllSaleDocuments, {
  SaleDocuments,
} from "../utils/getAllSaleDocuments";

export default function SaleDocumentsPage() {
  const [documents, setDocuments] = createSignal<SaleDocuments>([]);

  const navigate = useNavigate();

  onMount(async () => {
    const documents = await getAllSaleDocuments();
    setDocuments(documents);
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
                  {new Date(doc.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </main>
  );
}
