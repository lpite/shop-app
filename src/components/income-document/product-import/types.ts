import type { Product as BackendProduct } from "../../../types/product";

export interface ImportedProduct {
	article: string;
	name: string;
	quantity: string;
	price: string;
	suggestedProduct?: BackendProduct | null;
}