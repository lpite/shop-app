import { useNavigate } from "@solidjs/router";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@suid/material";
import { createSignal, For, JSX, onMount } from "solid-js";
import NewProductPopup from "../components/Nomenclature/NewProductPopup/NewProductPopup";
import { API_URL } from "../config/config";

export default function Nomenclature() {
  const [products, setProducts] = createSignal<any[]>([]);
  const [isFetching, setIsFetching] = createSignal(false);
  const [openModal, setOpenModal] = createSignal(false);
  const navigate = useNavigate();

  onMount(async () => {
    const prods = await fetch(`${API_URL}/get/products/`)
      .then((res) => res.json())
      .catch((err) => []);
    setProducts(prods);
  });

  function openProduct(product_id: number) {
    navigate(`/product/${product_id}`);
  }
  const onScroll: JSX.EventHandlerUnion<HTMLDivElement, UIEvent> = async (
    e
  ) => {
    if (!isFetching()) {
      if (e.currentTarget.scrollHeight / 2 - 600 < e.currentTarget.scrollTop) {
        setIsFetching(true);
        const prods = await fetch(
          `${API_URL}/get/products/?skip=${products().length}`
        )
          .then((res) => res.json())
          .catch((err) => []);
        setProducts([...products(), ...prods]);
        setIsFetching(false);
      }
    } else {
    }
  };
  return (
    <main style={{ height: "85%" }}>
      <h1>Номенклатура</h1>
      <div style={{ margin: "10px" }}>
        <Button onClick={() => setOpenModal(true)} variant="contained">
          Створити
        </Button>
        <NewProductPopup
          isOpen={openModal()}
          closeModal={() => setOpenModal(false)}
        />
      </div>
      <Box onScroll={onScroll} sx={{ height: "90%", overflowY: "scroll" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Пошуковий код</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Ціна</TableCell>
              <TableCell>Кількість</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <For each={products()}>
              {(prod) => (
                <TableRow onDblClick={() => openProduct(prod.product_id)}>
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
  );
}
