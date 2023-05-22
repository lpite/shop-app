import { API_URL } from "../config/config";

export type SaleDocuments = {
  document_id: number;
  isPosted: boolean;
  createdAt: Date;
  updatedAt: Date;
}[];

export default async function getAllSaleDocuments(): Promise<SaleDocuments> {
  const documents = await fetch(`${API_URL}/get/sale-documents/`)
    .then((res) => res.json())
    .catch((err) => []);

  return documents;
}
