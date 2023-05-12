import { API_URL } from "../config/config";

type UpdateOneProduct = {
  productId: number | string;
  product: { product_id: number; name: string }; //  CHANGE THIS
};

export default async function updateOneProduct({
  productId,
  product,
}: UpdateOneProduct): Promise<{ ok: boolean }> {
  const response = await fetch(
    `${API_URL}/update/product/?productId=${productId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(product),
    }
  )
    .then((res) => res.json())
    .catch((e) => {
      console.error(e);
      return { ok: false };
    });

  return response;
}
