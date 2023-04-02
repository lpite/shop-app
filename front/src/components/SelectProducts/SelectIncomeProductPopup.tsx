import { Box, Button, Modal, TextField } from "@suid/material";
import { createSignal } from "solid-js";
import { Product } from "../../pages/SelectProducts";

type SelectIncomeProductPopupProps = {
  isOpen: boolean;
  closeModal: () => void;
  productPrice: number | undefined;
  productId: number;
  productName: string;
  selectProduct: (product: Product) => void;
  product:any
};

export default function SelectIncomeProductPopup(
  props: SelectIncomeProductPopupProps
) {
  const [productData, setProductData] = createSignal({
    quantity: 1,
    price: props.product.price || 0,
  });
  function selectProductAndCloseModal() {
    props.selectProduct({
      ...productData(),
      product_id: props.productId,
      name: props.productName,
    });
    closeModal();
  }
  function closeModal() {
    props.closeModal();
  }
  
  console.log(props.product())
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
        >
          {/* <TextField
            label="Ціна"
            type="number"
            defaultValue={props.productPrice}
          /> */}
          <TextField
            type="number"
            value={productData().price}
            onChange={(e, val) =>
              setProductData({
                ...productData(),
                price: Number(val) || 1,
              })
            }
          />
          <input
            type="number"
            value={productData().price}
            onInput={({ currentTarget }) =>
              setProductData({
                ...productData(),
                price: Number(currentTarget.value) || 1,
              })
            }
          />

          <hr />
          <input
            type="number"
            value={productData().quantity}
            onInput={({ currentTarget }) =>
              setProductData({
                ...productData(),
                quantity: Number(currentTarget.value) || 1,
              })
            }
          />
          {/* <TextField label="Кількість" type="number" defaultValue={productCount()} /> */}
          <hr />

          <div>
            <Button
              variant="contained"
              type="button"
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
