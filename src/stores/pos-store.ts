import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PosStore = {
	isResizing: boolean;
	cartHeight: number;
	startY: number;
	startCartHeight: number;
};

export const usePosStore = create<PosStore>()(
	persist(
		(_) => ({
			isResizing: false,
			cartHeight: 200,
			startY: 0,
			startCartHeight: 200,
		}),
		{
			name: "pos-store",
		},
	),
);
