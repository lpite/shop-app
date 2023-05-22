import { Box, Button, Modal, TextField } from "@suid/material";
import { createSignal, JSX } from "solid-js";
import { API_URL } from "../../../config/config";
import styles from "./NewProductPopup.module.scss";
import createOneProduct from "../../../utils/createOneProduct";

type NewProductPopupProps = {
  closeModal: () => void;
  isOpen: boolean;
};

export default function NewProductPopup(props: NewProductPopupProps) {
  const [newProduct, setNewProduct] = createSignal({ name: "" });

  async function saveProduct() {
    const response = await createOneProduct({ product: newProduct() });
    if (!response.ok) {
      alert("Error");
    } else {
      props.closeModal();
    }
  }
  function changeProductName(e: any) {
    setNewProduct({ ...newProduct(), name: e.currentTarget.value });
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
        <TextField
          value={newProduct().name}
          onChange={changeProductName}
          variant="outlined"
          label="Назва товару"
        />
        <Button onClick={saveProduct}>Зберегти</Button>
      </Box>
    </Modal>
  );
}
