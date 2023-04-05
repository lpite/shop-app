import { useNavigate, useParams } from "@solidjs/router";
import { Button } from "@suid/material";
import { createSignal, onMount } from "solid-js";
import { API_URL } from "../config/config";
import SaveIcon from "@suid/icons-material/Save";
import Divider from "@suid/material/Divider";
import TextField from "@suid/material/TextField";
import Select from "@suid/material/Select";
import MenuItem from "@suid/material/MenuItem";
import FormControl from "@suid/material/FormControl";
import InputLabel from "@suid/material/InputLabel";

export default function ProductPage() {
  const [product, setProduct] = createSignal({ product_id: 0, name: "" });
  const params = useParams();
  const navigate = useNavigate();
  onMount(async () => {
    const prod = await fetch(
      `${API_URL}/get/product/?productId=${params.productId}`
    )
      .then((res) => res.json())
      .catch((err) => {});
    setProduct(prod);
  });

  async function updateProduct() {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    const res = await fetch(
      `${API_URL}/update/product/?productId=${params.productId}`,
      {
        headers: headers,
        method: "PATCH",
        body: JSON.stringify(product()),
      }
    ).then((res) => res.json());
    if (res.ok) {
    } else {
      alert("ne ok");
    }
  }
  async function updateProductAndClose() {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    const res = await fetch(
      `${API_URL}/update/product/?productId=${params.productId}`,
      {
        headers: headers,
        method: "PATCH",
        body: JSON.stringify(product()),
      }
    ).then((res) => res.json());
    if (res.ok) {
      navigate("/nomenclature/");
    } else {
      alert("ne ok");
    }
  }
  return (
    <main class="page">
      <h1 style={{ margin: "15px" }}>Товар {product().name}</h1>
      <div style={{ display: "flex", margin: "15px" }}>
        <Button variant="contained" onClick={updateProductAndClose}>
          Зберегти та закрити
        </Button>
        <Divider orientation="vertical" flexItem sx={{ margin: "5px" }} />
        <Button sx={{ width: "10px" }} onClick={updateProduct}>
          <SaveIcon />
        </Button>
      </div>
      <div
        style={{
          margin: "15px",
          width: "40%",
          display: "flex",
          "flex-direction": "column",
          gap: "8px",
        }}
      >
        <div style={{ margin: "15px 0" }}>
          <TextField
            type="string"
            label="Пошуковий код"
            value={product().product_id}
            onChange={(e, val) =>
              setProduct({ ...product(), product_id: Number(val) })
            }
            sx={{ width: "130px" }}
            size="small"
            inputProps={{
              maxLength: 4,
            }}
          />
          <TextField
            type="string"
            label="Артикул"
            sx={{ width: "130px", margin: "0 10px" }}
            size="small"
          />
        </div>

        <TextField
          type="string"
          label="Назва"
          value={product().name}
          size="small"
          onChange={(e, val) => setProduct({ ...product(), name: val })}
        />
      </div>
      <Divider orientation="horizontal" />
      <div style={{ margin: "15px" }}>
        <FormControl sx={{ width: "300px" }} size="small">
          <InputLabel>Місце у магазині</InputLabel>
          <Select size="small" label="Місце у магазині"></Select>
        </FormControl>
      </div>
    </main>
  );
}
