import { useNavigate, useParams } from "@solidjs/router";
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@suid/material";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import { createSignal, For, onMount } from "solid-js";
import ProductRow from "../components/ProductRow/ProductRow";
import SelectIncomeProductPopup from "../components/SelectProducts/SelectIncomeProductPopup";
import getAllProducts, { Product } from "../utils/getAllProducts";

export default function SelectProducts() {
  const [products, setProducts] = createSignal<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = createSignal<Product[]>([]);
  const [selectedProductData, setSelectedProductData] = createSignal({
    price: 0,
    id: 1,
    name: "",
  });

  const params = useParams();
  const navigate = useNavigate();
  onMount(async () => {
    const prods = await getAllProducts({});
    setProducts(prods);
  });

  function selectProduct({ name, price, product_id, quantity }: Product) {
    const product = selectedProducts().find(
      (prod) => prod.product_id === product_id
    );
    if (product) {
      setSelectedProducts(
        selectedProducts().map((prod) => {
          if (prod.product_id === product_id) {
            return { ...prod, quantity: prod.quantity + quantity };
          }
          return prod;
        })
      );
    } else {
      setSelectedProducts([
        ...selectedProducts(),
        { product_id, name, price: price || 0, quantity: quantity },
      ]);
    }
  }

  function selectProductIncome({ name, price, product_id, quantity }: Product) {
    setSelectedProductData({ price: price, id: product_id, name: name });
    setIsOpen(true);
  }

  function removeSelectedProduct(product_id: number) {
    setSelectedProducts(
      selectedProducts().filter((el) => el.product_id !== product_id)
    );
  }
  const [isOpen, setIsOpen] = createSignal(false);
  console.log(params.documentId);
  function goBackToDocument() {
    navigate(
      `/${params.type}/${params.documentId}/?products=${JSON.stringify(
        selectedProducts()
      )}`
    );
  }

  return (
    <main class="page" style={{ height: "90%" }}>
      <SelectIncomeProductPopup
        isOpen={isOpen()}
        closeModal={() => setIsOpen(false)}
        productPrice={selectedProductData().price}
        productId={selectedProductData().id}
        productName={selectedProductData().name}
        selectProduct={selectProduct}
        product={selectedProductData}
      />
      <div style={{ margin: "5px" }}>
        <Button variant="contained" onClick={goBackToDocument}>
          Додати в документ
        </Button>
        <hr />
        <div style={{ display: "flex" }}>
          <TextField size="small" placeholder="Поле для пошуку" />
          <Divider orientation="vertical" flexItem sx={{ margin: "5px" }} />
          <Button variant="contained">Пошук</Button>
        </div>
      </div>
      <Box sx={{ overflowY: "scroll", maxHeight: "60vh", height: "60%" }}>
        <Table
          sx={{ width: "95%", margin: "0 auto" }}
          size="small"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              <TableCell align="left">Пошуковий код</TableCell>
              <TableCell align="left">Назва</TableCell>
              <TableCell align="right">Ціна</TableCell>
              <TableCell align="center">Кількість</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <For each={products()}>
              {({ name, product_id, price, quantity }) => (
                <TableRow
                  onDblClick={() =>
                    params.type === "income"
                      ? selectProductIncome({
                          name,
                          product_id,
                          price,
                          quantity,
                        })
                      : selectProduct({ name, product_id, price, quantity: 1 })
                  }
                >
                  <TableCell align="left">{product_id}</TableCell>
                  <TableCell align="left">{name}</TableCell>
                  <TableCell align="right">{price}</TableCell>
                  <TableCell align="center">{quantity}</TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </Box>

      <Box
        sx={{
          bottom: 0,
          width: "100%",
          height: "30%",
          overflowY: "scroll",
          borderTop: "2px solid black",
        }}
        backgroundColor="white"
      >
        <Table
          sx={{ width: "95%", margin: "0 auto" }}
          size="small"
          stickyHeader
        >
          <TableHead>
            <TableRow sx={{ height: 30 }}>
              <TableCell align="left">Пошуковий код</TableCell>
              <TableCell align="left">Назва</TableCell>
              <TableCell align="right">Ціна</TableCell>
              <TableCell align="center">Кількість</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <For each={selectedProducts()}>
              {({ name, product_id, price, quantity }) => (
                <ProductRow
                  product_id={product_id}
                  name={name}
                  price={price}
                  quantity={quantity}
                  contextMenuItems={
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => removeSelectedProduct(product_id)}
                      >
                        Видалити
                      </Button>
                    </>
                  }
                />
              )}
            </For>
          </TableBody>
        </Table>
      </Box>
    </main>
  );
}

type RowProductProps = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

// function RowProduct(props: RowProductProps) {
//   const params = useParams();

//   function onDoubleClick() {
//     if (params.type === "income") {
//       selectProductIncome({
//         name:props.name,
//       });
//     } else {
//       selectProduct({ name, product_id, price, quantity: 1 });
//     }
//   }
//   return (
//     <TableRow onDblClick={onDoubleClick}>
//       <TableCell align="left">{product_id}</TableCell>
//       <TableCell align="left">{name}</TableCell>
//       <TableCell align="right">{price}</TableCell>
//       <TableCell align="center">{quantity}</TableCell>
//     </TableRow>
//   );
// }
