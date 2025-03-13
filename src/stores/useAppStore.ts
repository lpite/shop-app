import { create } from "zustand";
import { CartStore, cartSlice } from "./cartStoreSlice";
import { devtools, persist } from "zustand/middleware";
import { DocumentStore, documentStoreSlice } from "./documentStoreSlice";
import { testSlice, TestSlice } from "./testSlice";
export const useAppStore = create<CartStore & DocumentStore & TestSlice>()(
	devtools(
		persist(
			(...a) => ({
				...cartSlice(...a),
				...documentStoreSlice(...a),
				...testSlice(...a),
			}),
			{ name: "app-store" },
		),
	),
);
