import { API_URL } from "../config/config";

type GetOneIncomeDocument = {
  documentId: number | string;
};

export type IncomeDocument = {
  document_id: number;
  isPosted: boolean;
  createdAt: Date;
  updatedAt: Date;
  products: DocumentProduct[];
};

export type DocumentProduct = {
  product_id: number;
  name:string,
  price: number;
  quantity: number;
};

export default async function getOneIncomeDocument({
  documentId,
}: GetOneIncomeDocument): Promise<IncomeDocument> {
  const document = await fetch(
    `${API_URL}/get/income-document/?document_id=${documentId}`
  )
    .then((res) => res.json())
    .catch((err) => {});
  return document;
}
