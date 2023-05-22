import { useNavigate } from "@solidjs/router";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@suid/material";
import { createSignal, For, onMount } from "solid-js";
import getAllIncomeDocuments, {
  IncomeDocuments,
} from "../utils/getAllIncomeDocuments";

export default function IncomeDocumentsPage() {
  const [documents, setDocuments] = createSignal<IncomeDocuments>([]);

  const navigate = useNavigate();

  onMount(async () => {
    const docs = await getAllIncomeDocuments();
    setDocuments(docs);
  });

  function openIncomeDocument(document_id: number | string) {
    navigate(`/income/${document_id}`);
  }

  return (
    <main class="page">
      <h1>Надходження</h1>
      <Button onClick={() => openIncomeDocument("new")} variant="contained">
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
                onDblClick={() => openIncomeDocument(doc.document_id)}
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
