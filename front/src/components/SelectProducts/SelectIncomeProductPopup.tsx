import { Box, Button, Modal, TextField } from "@suid/material";
import { createEffect, createSignal, onMount } from "solid-js";
import { Product } from "../../utils/getAllProducts";

type SelectIncomeProductPopupProps = {
  isOpen: boolean;
  closeModal: () => void;
  selectProduct: (product: Product) => void;
  product: Product;
};

export default function SelectIncomeProductPopup(
  props: SelectIncomeProductPopupProps
) {
  const [productData, setProductData] = createSignal({
    quantity: 1,
    price: 0,
  });
  function selectProductAndCloseModal() {
    props.selectProduct({
      ...productData(),
      product_id: props.product.product_id,
      name: props.product.name,
    });
    closeModal();
  }
  function closeModal() {
    setProductData({ quantity: 1, price: 0 });
    props.closeModal();
  }
  createEffect(() => {
    setProductData({
      price: props.product.price,
      quantity: 1,
    });
  });
  function onChangePrice(e: unknown, val: string) {
    const numberValue = parseFloat(val.replace(/e/, "")) || 0;
    setProductData({ price: numberValue, quantity: productData().quantity });
  }

  return (
    <Modal open={props.isOpen} onClose={props.closeModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          backgroundColor: "white",
          border: "2px solid #000",
          boxShadow: "24px",
          display: "flex",
          flexDirection: "column",
          p: 4,
        }}
      >
        <form
          style={{
            display: "flex",
            "flex-direction": "column",
          }}
          onSubmit={() => alert("1")}
        >
          <TextField
            type="text"
            value={productData().price}
            onChange={onChangePrice}
            label="Ціна"
          />

          <hr />
          <TextField
            type="text"
            defaultValue={1}
            onChange={(e, val) =>
              setProductData({
                ...productData(),
                quantity: parseFloat(val),
              })
            }
            label="Кількість"
          />
          <hr />
          <div>
            <Button
              variant="contained"
              type="submit"
              onClick={selectProductAndCloseModal}
            >
              Далі
            </Button>

            <Button variant="contained" onClick={closeModal}>
              Закрити
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
