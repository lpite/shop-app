import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PriceTagType = "default" | "simple";

export type PriceTag = {
	id: string;
	searchCode: string;
	name: string;
	price: number;
	type: PriceTagType;
};

type NewPriceTag = Omit<PriceTag, "id">;

// crypto.randomUUID доступний лише в secure context, а застосунок може
// працювати по http в локальній мережі
function createId() {
	if (typeof crypto?.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type PriceTagsStore = {
	tags: PriceTag[];
	smallTags: boolean;
	addTag: (tag: NewPriceTag) => void;
	updateTag: (id: string, patch: Partial<NewPriceTag>) => void;
	removeTag: (id: string) => void;
	clearTags: () => void;
	setSmallTags: (value: boolean) => void;
};

export const usePriceTagsStore = create<PriceTagsStore>()(
	persist(
		(set) => ({
			tags: [],
			smallTags: false,
			addTag: (tag) =>
				set((state) => ({
					tags: [{ ...tag, id: createId() }, ...state.tags],
				})),
			updateTag: (id, patch) =>
				set((state) => ({
					tags: state.tags.map((tag) =>
						tag.id === id ? { ...tag, ...patch } : tag,
					),
				})),
			removeTag: (id) =>
				set((state) => ({
					tags: state.tags.filter((tag) => tag.id !== id),
				})),
			clearTags: () => set({ tags: [] }),
			setSmallTags: (value) => set({ smallTags: value }),
		}),
		{
			name: "price-tags",
		},
	),
);
