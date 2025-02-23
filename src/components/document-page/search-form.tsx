import { FormEvent, useEffect, useState } from "react";
import { Product } from "../../types/product";
import { fetcher } from "../../utils/fetcher";
import useSWR from "swr";
import { useAppStore } from "../../stores/useAppStore";

function sortProducts(a: any, b: any) {
	if (a.name > b.name) {
		return 1;
	}
	if (a.name < b.name) {
		return -1;
	}
	return 0;
}

function searchThroughProducts(
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

	if (exactSearch) {
		return false;
	}

	const queryArray = lowerSearchValue.split(" ");
	if (queryArray.every((word) => lowerProductName.includes(word))) {
		return true;
	}

	if (
		product.name.includes(trimmedSearchValue) ||
		product.vendorCode.includes(trimmedSearchValue) ||
		product.code.includes(trimmedSearchValue) ||
		product.description.includes(trimmedSearchValue)
	) {
		return true;
	}

	return false;
}

type SearchFormProps = {
	setFilteredProducts: any;
};

export default function SearchForm({ setFilteredProducts }: SearchFormProps) {
	const { searchValue } = useAppStore();
	// const [searchValue, setSearchValue] = useState("");
	const [exactSearch, setExactSearch] = useState(false);
	const [onlyInStock, setOnlyInStock] = useState(false);

	async function filterProducts(e: FormEvent) {
		e.preventDefault();
		setFilteredProducts([]);
		const products = await refreshProducts();

		const filtered = products
			?.sort(sortProducts)
			.filter((product) =>
				searchThroughProducts(product, searchValue, onlyInStock, exactSearch),
			);
		if (filtered) {
			setFilteredProducts(filtered);
		}
	}
	useEffect(() => {
		if (!searchValue) {
			return;
		}
		const filtered = products
			?.sort(sortProducts)
			.filter((product) =>
				searchThroughProducts(product, searchValue, onlyInStock, exactSearch),
			);

		if (filtered) {
			setFilteredProducts(filtered);
		}
	}, [onlyInStock, exactSearch]);
	const {
		data: products,
		mutate: refreshProducts,
		isLoading: isLoadingProducts,
		isValidating: isValidatingProducts,
	} = useSWR(
		searchValue.length ? "/products/" : null,
		() =>
			fetcher<Product[]>({
				url: "/shop/hs/app/product/",
				method: "GET",
			}),
		{
			revalidateOnFocus: false,
			revalidateOnMount: false,
			revalidateIfStale: false,
			revalidateOnReconnect: false,
		},
	);

	return (
		<form className="row-start-2 col-span-6 flex" onSubmit={filterProducts}>
			<input
				className="border-2 w-full h-10 rounded-lg px-2"
				value={searchValue}
				onChange={({ target }) =>
					useAppStore.setState({ searchValue: target.value })
				}
			/>
			<button
				disabled={isValidatingProducts || isValidatingProducts}
				className="mx-2 border-2 h-10 px-3 rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:bg-slate-400"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					fill="currentColor"
					viewBox="0 0 16 16"
				>
					<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
				</svg>
			</button>
			<label className="shrink-0 flex gap-2 items-center h-10 mr-2">
				<input
					type="checkbox"
					checked={exactSearch}
					onChange={() => setExactSearch(!exactSearch)}
					disabled={isValidatingProducts || isLoadingProducts}
				/>
				по коду
			</label>
			<label className="shrink-0 flex gap-2 items-center h-10">
				<input
					type="checkbox"
					checked={onlyInStock}
					onChange={() => setOnlyInStock(!onlyInStock)}
					disabled={isValidatingProducts || isLoadingProducts}
				/>
				тільки наявність
			</label>
		</form>
	);
}
