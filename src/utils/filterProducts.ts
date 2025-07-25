import { Product } from "../types/product";

export function filterProducts(
	product: Product,
	searchValue: string,
	onlyInStock: boolean,
	exactSearch: boolean,
) {
	const trimmedSearchValue = searchValue.trim();
	const lowerSearchValue = trimmedSearchValue.toLowerCase();
	const lowerProductName = product.name.toLowerCase();

	if (onlyInStock && product.quantity === 0) {
		return false;
	}

	if (product.searchCode === trimmedSearchValue) {
		return true;
	}

	if (product.code === trimmedSearchValue) {
		return true;
	}

	if (product.code.replace("-", "") === trimmedSearchValue) {
		return true;
	}

	if (product.vendorCode === trimmedSearchValue) {
		return true;
	}

	if (exactSearch) {
		return false;
	}

	const queryArray = lowerSearchValue.split(" ");
	if (queryArray.every((word) => lowerProductName.includes(word))) {
		return true;
	}

	if (
		product.name.includes(trimmedSearchValue) ||
		product.description?.includes(trimmedSearchValue)
	) {
		return true;
	}

	return false;
}
