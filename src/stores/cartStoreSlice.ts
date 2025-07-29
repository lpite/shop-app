import { StateCreator } from "zustand";
import { FTSProduct } from "../types/product";

export type CartStore = {
	cartProducts: FTSProduct[];
	addToCart: (p: FTSProduct) => void;
	removeFromCart: (searchCode: string) => void;
	editCart: (searchCode: string, q: number) => void;
	clearCart: () => void;
};

export const cartSlice: StateCreator<CartStore, [], [], CartStore> = (set) => ({
	cartProducts: [],
	clearCart: () => set((state) => ({ ...state, cartProducts: [] })),
	addToCart: (p) =>
		set((state) => {
			console.log(state.cartProducts, p);
			if (state.cartProducts.find((el) => el.searchCode === p.searchCode)) {
				return {
					cartProducts: state.cartProducts.map((el) => {
						if (el.searchCode === p.searchCode) {
							return { ...el, quantity: el.quantity + 1 };
						}
						return el;
					}),
				};
			}
			return { cartProducts: [...state.cartProducts, p] };
		}),
	removeFromCart: (s) =>
		set((state) => {
			const newProducts = state.cartProducts.filter(
				(el) => el.searchCode !== s,
			);
			return { ...state, cartProducts: newProducts };
		}),
	editCart: (s, q) =>
		set((state) => {
			if (q < 0) {
				return state;
			}
			const newProducts = state.cartProducts.map((el) => {
				if (el.searchCode === s) {
					return { ...el, quantity: q };
				}
				return el;
			});
			return { ...state, cartProducts: newProducts };
		}),
});
