import { StateCreator } from "zustand";

export type DocumentStore = {
  isResizing: boolean;
  cartHeight: number;
  startY: number;
  startCartHeight: number;
  searchValue: string;
};

export const documentStoreSlice: StateCreator<
  DocumentStore,
  [],
  [],
  DocumentStore
> = () => ({
  isResizing: false,
  cartHeight: 200,
  startY: 0,
  startCartHeight: 200,
  searchValue: "",
});
