import { StateCreator } from "zustand";

export type TestSlice = {
  selected: string[];
  /**
   * @description meow
   */
  toggleSelected: (code: string) => void;
  deselectAll: () => void;
  selectedAction: "replace" | "set";
  selectActionD: (a: "replace" | "set") => void;
  forReplace: { searchV: string; replaceW: string; field: string };
  setReplace: (s: Partial<TestSlice["forReplace"]>) => void;
};

export const testSlice: StateCreator<TestSlice, [], [], TestSlice> = (set) => ({
  selected: [],
  selectedAction: "set",
  forReplace: { searchV: "", replaceW: "", field: "" },

  toggleSelected: (code) =>
    set((state) => {
      if (state.selected.includes(code)) {
        return { selected: state.selected.filter((el) => el !== code) };
      }

      return { selected: [...state.selected, code] };
    }),
  deselectAll: () =>
    set((state) => {
      return { ...state, selected: [] };
    }),
  selectActionD: (a) => set((state) => ({ ...state, selectedAction: a })),
  setReplace: (v) =>
    set((state) => ({ ...state, forReplace: { ...state.forReplace, ...v } })),
});
