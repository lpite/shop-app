import { A, useNavigate, useParams } from "@solidjs/router";
import { Save } from "@suid/icons-material";
import {
  Button,
  Divider,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@suid/material";
import { createSignal, For, onMount } from "solid-js";
import ProductRow from "../components/ProductRow/ProductRow";
import { API_URL } from "../config/config";

type IncomeDocument = {
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
};
export default function IncomeDocument() {
  const [incomeDocument, setIncomeDocument] = createSignal<IncomeDocument>({
    time: 0,
    document_id: 0,
    products: [],
    isPosted: false,
  });

  const navigate = useNavigate();
  const params = useParams();

  onMount(async () => {
    if (params.documentId !== "new") {
      const doc = await fetch(
        `${API_URL}/get/income-document/?document_id=${params.documentId}`
      )
        .then((res) => res.json())
        .catch((err) => {});
      setIncomeDocument(doc);
    }
    const selectedProducts = JSON.parse(
      sessionStorage.getItem("selectedProducts") || "[]"
    );
    if (selectedProducts.length) {
      sessionStorage.removeItem("selectedProducts");
      setIncomeDocument({
        ...incomeDocument(),
        products: [...incomeDocument().products, ...selectedProducts],
      });
    }
  });
  async function saveDocument() {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    await fetch(
      `${API_URL}/${
        params.documentId === "new" ? "create" : "update"
      }/income-document/?document_id=${incomeDocument().document_id}`,
      {
        method: params.documentId === "new" ? "POST" : "PATCH",
        body: JSON.stringify(incomeDocument()),
        headers: headers,
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error((await res.json())?.msg);
        }
        return res.json();
      })
      .then((json) => {
        if (json?.outOfStock?.length) {
          setIncomeDocument({ ...incomeDocument(), products: json.outOfStock });
          alert("Кількість");
        } else {
          if (params.documentId === "new") {
            navigate(`/income/${json.document_id}`);
          }
        }
      })
      .catch((e) => {
        alert(e);
      });
  }
  function postDocument() {
    setIncomeDocument({ ...incomeDocument(), isPosted: true });
    saveDocument();
  }
  function unPostDocument() {
    setIncomeDocument({ ...incomeDocument(), isPosted: false });
    saveDocument();
  }
  function setPrices() {
    navigate(
      `/set-prices/?products=${JSON.stringify(incomeDocument().products)}`
    );
  }

  function deleteProduct(index: number) {
    const newProducts = incomeDocument().products.filter(
      (prod, i) => i !== index
    );
    setIncomeDocument({ ...incomeDocument(), products: newProducts });
  }

  return (
    <main class="page">
      <h1>Документ надходження {incomeDocument().document_id}</h1>
      <div style={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            "justify-content": "flex-start",
            width: "50%",
          }}
        >
          <Button variant="contained">Провести та закрити</Button>
          <Button variant="text" onClick={saveDocument}>
            <Save />
          </Button>
          <Divider orientation="vertical" sx={{ margin: "0 5px" }} flexItem />
          <Button variant="text" onClick={postDocument}>
            Провести
          </Button>
          <Divider orientation="vertical" sx={{ margin: "0 5px" }} flexItem />
          <CreateBasedOnMenu setPrices={setPrices} />
        </div>
        <div
          style={{
            display: "flex",
            "justify-content": "flex-end",
            width: "50%",
          }}
        >
          <AdditionalFunctionsMenu unPostDocument={unPostDocument} />
          <Button variant="contained" onClick={unPostDocument}>
            Відмінити проведення
          </Button>
        </div>
      </div>

      <h1>час {incomeDocument()?.time}</h1>
      <h1>isPosted {incomeDocument()?.isPosted.toString()}</h1>
      <A href="/select-products/income">товари</A>
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
            <For each={incomeDocument().products}>
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

type CreateBasedOnMenuProps = {
  setPrices: () => void;
};

function CreateBasedOnMenu(props: CreateBasedOnMenuProps) {
  const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null);
  const open = () => Boolean(anchorEl());
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open() ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open() ? "true" : undefined}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        Створити на основі
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl()}
        open={open()}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
      >
        <MenuItem onClick={props.setPrices}>
          Встановлення цін номенклатури
        </MenuItem>
      </Menu>
    </div>
  );
}
type AdditionalFunctionsMenuProps = {
  unPostDocument: () => void;
};
function AdditionalFunctionsMenu(props: AdditionalFunctionsMenuProps) {
  const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null);
  const open = () => Boolean(anchorEl());
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open() ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open() ? "true" : undefined}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        Додатково
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl()}
        open={open()}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
      >
        <MenuItem onClick={()=>props.unPostDocument()}>Відмінити проведення</MenuItem>
      </Menu>
    </div>
  );
}
