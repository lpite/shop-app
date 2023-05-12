import { API_URL } from "../config/config";

type CreateOneProduct = {
  product: { name: string };
};

export default async function createOneProduct({
  product,
}: CreateOneProduct): Promise<{ ok: boolean }> {
  const response = await fetch(`${API_URL}/create/product/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  })
    .then((res) => res.json())
    .catch((e) => {
      console.log(e);
      return { ok: false };
    });
  return response;
}
