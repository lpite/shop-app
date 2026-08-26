import { create } from "zustand";
import { FTSProduct } from "../types/product";
import { persist } from "zustand/middleware";

export type CartStore = {
	cartProducts: FTSProduct[];
	addToCart: (p: FTSProduct) => void;
	removeFromCart: (id: string) => void;
	editCart: (id: string, q: number) => void;
	clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
	persist(
		(set) => ({
			cartProducts: [],
			clearCart: () => set((state) => ({ ...state, cartProducts: [] })),
			addToCart: (p) =>
				set((state) => {
					console.log(state.cartProducts, p);
					if (state.cartProducts.find((el) => el.id === p.id)) {
						return {
							cartProducts: state.cartProducts.map((el) => {
								if (el.id === p.id) {
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
					const newProducts = state.cartProducts.filter((el) => el.id !== s);
					return { ...state, cartProducts: newProducts };
				}),
			editCart: (s, q) =>
				set((state) => {
					if (q < 0) {
						return state;
					}
					const newProducts = state.cartProducts.map((el) => {
						if (el.id === s) {
							return { ...el, quantity: q };
						}
						return el;
					});
					return { ...state, cartProducts: newProducts };
				}),
		}),
		{ name: "cart-store" },
	),
);
