import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IncomeDocumentProduct {
	ref: string;
	supplierPrice: number;
	retailPrice: number;
	quantity: number;
	name: string;
	selected?: boolean;
}

export interface IncomeDocument {
	number: string;
	date: string;
	posted: boolean;
	products: IncomeDocumentProduct[];
	comment: string;
	supplierRef: string;
	counterPartyRef: string;
	warehouseRef: string;
}

interface Store {
	document: IncomeDocument;
	setDocument: (d: IncomeDocument) => void;
	changeProductPrice: (index: number, newPrice: string) => void;
	setDocumentProducts: (products: IncomeDocumentProduct[]) => void;
}

const initialDocument: IncomeDocument = {
	number: "",
	date: "",
	posted: false,
	comment: "",
	supplierRef: "",
	counterPartyRef: "",
	warehouseRef: "",
	products: [],
};

export const useIncomeDocumentHepler = create<Store>()(
	persist(
		(set) => ({
			document: initialDocument,
			changeProductPrice: (index, newPrice) =>
				set((state) => {
					const updatedProducts = state.document.products.map((product, i) =>
						i === index
							? { ...product, retailPrice: Number(newPrice) || 0 }
							: product,
					);

					return {
						document: {
							...state.document,
							products: updatedProducts,
						},
					};
				}),
			setDocumentProducts: (products) =>
				set((state) => {
					return {
						document: {
							...state.document,
							products: products,
						},
					};
				}),
			setDocument: (d) =>
				set(() => ({
					document: d,
				})),
		}),
		{
			name: "income-document-helper",
		},
	),
);
