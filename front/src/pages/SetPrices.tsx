import { useParams, useSearchParams } from "@solidjs/router";
import {
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@suid/material";
import SaveIcon from "@suid/icons-material/Save";
import CloseIcon from "@suid/icons-material/Close";

import Button from "@suid/material/Button";
import { Key } from "@solid-primitives/keyed";
import { createEffect, createSignal, For, JSX, onMount } from "solid-js";
import { API_URL } from "../config/config";

async function getProductPrice(product_id: number) {
  return await fetch(`${API_URL}/get/price/?productId=${product_id}`).then(
    (res) => res.json()
  );
}

type Product = {
  product_id: number;
  name: string;
  price: number;
  quantity?: number;
};

export default function SetPrices() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = createSignal<Product[]>([]);
  function changeProductPrice(productIndex: number, newPrice: number) {
    setProducts(
      products().map((product, index) => {
        if (index === productIndex) {
          return { ...product, price: newPrice };
        }
        return product;
      })
    );
  }
  onMount(() => {
    const products: { [key: string]: Product } = {};
    const parsedProducts = JSON.parse(searchParams.products) as Product[];
    parsedProducts.forEach((product) => {
      products[product.product_id] = product;
    });
    setProducts(Object.values(products));
  });
  return (
    <main style={{ margin: "0 30px" }}>
      <div style={{ height: "170px" }}>
        <h1>Встановлення цін</h1>
        <div>
          <Button variant="contained">Провести і закрити</Button>
          <Button variant="text">
            <SaveIcon />
          </Button>
          <Button variant="contained">Провести</Button>
        </div>
        <hr />
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="contained" color="success">
            Додати
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button variant="contained" sx={{ width: 20 }} color="error">
            <CloseIcon />
          </Button>
        </div>
      </div>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Пошуковий код</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell align="center">Минула ціна</TableCell>
              <TableCell align="center">%</TableCell>
              <TableCell>Нова ціна</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Key each={products()} by={(product) => product.product_id}>
              {(product, i) => (
                <ProductLine
                  productIndex={i()}
                  product_id={product().product_id}
                  name={product().name}
                  price={product().price}
                  changeProductPrice={changeProductPrice}
                />
              )}
            </Key>
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}

type ProductLineProps = {
  productIndex: number;
  product_id: number;
  name: string;
  price: number;
  quantity?: number;
  changeProductPrice: (productIndex: number, newPrice: number) => void;
};

function ProductLine(props: ProductLineProps) {
  const [prevPrice, setPrevPrice] = createSignal(0);
  const [price, setPrice] = createSignal(props.price);

  onMount(async () => {
    setPrevPrice((await getProductPrice(props.product_id)).price);
  });
  const changePrice: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    event
  ) => {
    setPrice(Number(event.currentTarget.value) || 0);
    props.changeProductPrice(
      props.productIndex,
      Number(event.currentTarget.value) || 0
    );
  };
  return (
    <TableRow
      style={{
        "background-color": props.productIndex % 2 == 0 ? "lightgray" : "",
      }}
    >
      <TableCell style={{ width: "30px" }}>
        <Checkbox />
      </TableCell>
      <TableCell style={{ width: "120px" }}>{props.product_id}</TableCell>
      <TableCell>{props.name}</TableCell>
      <TableCell align="center" style={{ width: "90px" }}>
        {prevPrice()}
      </TableCell>
      <TableCell style={{ width: "90px" }} align="center">
        {((props.price / prevPrice()) * 100).toFixed(2)} %
      </TableCell>
      <TableCell style={{ width: "100px" }}>
        <TextField
          type="number"
          value={props.price}
          size="small"
          onChange={(_, value) =>
            props.changeProductPrice(props.productIndex, Number(value) || 0)
          }
          sx={{
            height: "30px",
          }}
          inputProps={{
            style:
              "padding:3px;width:50px;-moz-appearance:textfield;text-align:center",
          }}
        />
      </TableCell>
    </TableRow>
  );
}
