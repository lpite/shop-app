import { API_URL } from "../config/config";
import { DocumentProduct } from "./getOneIncomeDocument";

type GetOneSaleDocument = {
  documentId: number | string;
};

export type SaleDocument = {
  document_id: number;
  isPosted: boolean;
  createdAt: Date;
  updatedAt: Date;
  DocumentProducts: DocumentProduct[];
};

export default async function getOneSaleDocument({
  documentId,
}: GetOneSaleDocument): Promise<SaleDocument> {
  const document = await fetch(
    `${API_URL}/get/sale-document/?document_id=${documentId}`
  )
    .then((res) => res.json())
    .catch((err) => {});
  return document;
}
