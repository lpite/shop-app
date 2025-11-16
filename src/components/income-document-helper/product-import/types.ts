import type { Product as BackendProduct } from "../../../types/product";

export interface ImportedProduct {
	id: number;
	article: string;
	name: string;
	quantity: string;
	price: string;
	suggestedProduct?: BackendProduct | null;
	isSplit?: boolean;
}
