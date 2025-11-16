import { create } from "zustand";
import { parseImportedText } from "./import-parser";
import type { Product as BackendProduct } from "../../../types/product";
import type { ImportedProduct } from "./types";

interface ImportState {
	rawText: string;
	importedProducts: ImportedProduct[];

	setRawText: (text: string) => void;
	parseText: () => void;
	setImportedProducts: (products: ImportedProduct[]) => void;
	setSuggestedProduct: (
		index: number,
		product: (BackendProduct & { ref: string }) | null,
	) => void;
	updateRow: (index: number, patch: Partial<ImportedProduct>) => void;
	reset: () => void;
}

export const useImportStore = create<ImportState>((set, get) => ({
	rawText: "",
	importedProducts: [],

	setRawText: (text) => set({ rawText: text }),
	parseText: () =>
		set((state) => ({
			importedProducts: parseImportedText(state.rawText),
		})),
	setImportedProducts: (products) =>
		set(() => ({ importedProducts: products })),
	setSuggestedProduct: (index, product) =>
		set((state) => {
			const updated = [...state.importedProducts];
			if (updated[index]) updated[index].suggestedProduct = product;
			return { importedProducts: updated };
		}),
	updateRow: (index, patch) =>
		set((state) => ({
			importedProducts: state.importedProducts.map((row, i) =>
				i === index ? { ...row, ...patch } : row,
			),
		})),
	reset: () => set({ rawText: "", importedProducts: [] }),
}));
