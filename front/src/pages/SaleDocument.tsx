import { A, useNavigate, useParams } from "@solidjs/router";
import { createSignal, For, onMount } from "solid-js";
import { API_URL } from "../config/config";
import SaveIcon from "@suid/icons-material/Save";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@suid/material";
import ProductRow from "../components/ProductRow/ProductRow";

type SaleDocument = {
  document_id: number;
  time: number;
  isPosted: boolean;
  products: Product[];
};
type Product = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  serverQuantity?: number;
  isNew?: boolean;
};

export default function SaleDocument() {
  const [saleDocument, setSaleDocument] = createSignal<SaleDocument>({
    time: 0,
    document_id: 0,
    products: [],
    isPosted: false,
  });
  const params = useParams();
  const navigate = useNavigate();

  onMount(async () => {
    if (params.documentId !== "new") {
      const doc = await fetch(
        `${API_URL}/get/sale-document/?document_id=${params.documentId}`
      )
        .then((res) => res.json())
        .catch((err) => {});
      setSaleDocument(doc);
    }
    const selectedProducts = JSON.parse(
      sessionStorage.getItem("selectedProducts") || "[]"
    );
    if (selectedProducts.length) {
      sessionStorage.removeItem("selectedProducts");
      setSaleDocument({
        ...saleDocument(),
        products: [...saleDocument().products, ...selectedProducts],
      });
    }
  });

  function deleteProduct(index: number) {
    const newProducts = saleDocument().products.filter(
      (prod, i) => i !== index
    );
    setSaleDocument({ ...saleDocument(), products: newProducts });
  }

  function changeProductCount(product_id: number, quantity: number) {
    const newProducts = saleDocument().products.map((prod) => {
      return {
        ...prod,
        quantity: product_id === prod.product_id ? quantity : prod.quantity,
      };
    });
    setSaleDocument({ ...saleDocument(), products: newProducts });
  }

  async function saveDocument() {
    const savedDocument = saleDocument();
    const response = await updateOrCreateDocument(savedDocument);
    if (response.ok) {
    } else {
      alert(response.msg);
    }
  }
  async function postDocument() {
    const postedDocument = { ...saleDocument(), isPosted: true };
    const response = await updateOrCreateDocument(postedDocument);
    if (response.ok) {
      setSaleDocument({ ...saleDocument(), isPosted: true });
      if ("document" in response && params.documentId === "new") {
        navigate(`/sale/${response.document.document_id}`);
      }
    } else {
      alert(response.msg);
    }
  }
  async function unPostDocument() {
    const unPostedDocument = { ...saleDocument(), isPosted: false };
    const response = await updateOrCreateDocument(unPostedDocument);
    if (response.ok) {
      setSaleDocument({ ...saleDocument(), isPosted: false });
    } else {
      alert(response.msg);
    }
  }
  async function postAndCloseDocument() {
    const postedDocument = { ...saleDocument(), isPosted: true };
    const response = await updateOrCreateDocument(postedDocument);
    if (response.ok) {
      navigate("/sale/");
    } else {
      alert(response.msg);
      if ("outOfStock" in response && response.outOfStock?.length) {
        setSaleDocument({ ...saleDocument(), products: response.outOfStock });
      }
    }
  }
  type ReturnUpdateOrCreateDocument =
    | {
        ok: boolean;
        msg: string;
      }
    | {
        ok: true;
        document: SaleDocument;
      }
    | {
        ok: false;
        msg: string;
        outOfStock: Product[];
      };
  async function updateOrCreateDocument(
    document: SaleDocument
  ): Promise<ReturnUpdateOrCreateDocument> {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    const request = await fetch(
      `${API_URL}/${
        params.documentId === "new" ? "create" : "update"
      }/sale-document/?document_id=${saleDocument().document_id}`,
      {
        method: params.documentId === "new" ? "POST" : "PATCH",
        body: JSON.stringify(document),
        headers: headers,
      }
    )
      .then((res) => res.json())
      .catch((error) => {
        return { ok: false, msg: "Невідома помилка" };
      });
    return request;
  }
  return (
    <main style={{ margin: "10px 15px" }}>
      <Typography variant="h5">
        Документ продажу {saleDocument().document_id}
      </Typography>
      <Button variant="contained" onClick={postAndCloseDocument}>
        Провести та закрити
      </Button>
      <Button variant="outlined" onClick={postDocument}>
        Провести
      </Button>
      <Button variant="outlined" onClick={saveDocument}>
        <SaveIcon />
      </Button>
      <Button variant="contained" onClick={unPostDocument}>
        Відмінити проведення
      </Button>
      <h1>час {saleDocument().time}</h1>
      <h1>isPosted {saleDocument().isPosted.toString()}</h1>
      <A href="/select-products/sale">Підібрати товари</A>
      <TableContainer>
        <Table sx={{ width: "95%", margin: "0 auto" }} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">id</TableCell>
              <TableCell align="left">name</TableCell>
              <TableCell align="right">price</TableCell>
              <TableCell align="center">quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <For each={saleDocument().products}>
              {({ product_id, name, price, quantity, serverQuantity }, i) => (
                <>
                  <ProductRow
                    product_id={product_id}
                    name={name}
                    price={price}
                    quantity={quantity}
                    error={serverQuantity !== undefined}
                    contextMenuItems={
                      <>
                        <Button
                          sx={{ boxShadow: "none", margin: 2 }}
                          onClick={() => deleteProduct(i())}
                          variant="contained"
                          color="error"
                        >
                          Видалити
                        </Button>
                      </>
                    }
                  />
                </>
              )}
            </For>
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
