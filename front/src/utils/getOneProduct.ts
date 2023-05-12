import { type } from "os";
import { API_URL } from "../config/config";
import { Product } from "./getAllProducts";

type GetOneProduct = {
  productId: string | number;
};

export default async function getOneProduct({
  productId,
}: GetOneProduct): Promise<Product> {
  const product = await fetch(`${API_URL}/get/product/?productId=${productId}`)
    .then((res) => res.json())
    .catch((err) => {});
  return product;
}
