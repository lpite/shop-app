import { type } from "os";
import { API_URL } from "../config/config";

export type IncomeDocuments = {
  document_id: number;
  isPosted: boolean;
  createdAt: Date;
  updatedAt: Date;
}[];

export default async function getAllIncomeDocuments(): Promise<IncomeDocuments> {
  const documents = await fetch(`${API_URL}/get/income-documents/`)
    .then((res) => res.json())
    .catch((err) => []);
  return documents;
}