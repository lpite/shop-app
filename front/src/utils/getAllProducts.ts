import { API_URL } from "../config/config";

export type Product = {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
};

type GetAllProducts = {
  skip?: number | string;
};

export default async function getAllProducts({
  skip,
}: GetAllProducts): Promise<Product[]> {
  const products = await fetch(`${API_URL}/get/products/?skip=${skip || 0}`)
    .then((res) => res.json())
    .catch((err) => []);
  return products;
}
