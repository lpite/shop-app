import { FormEvent, useEffect, useState } from "react";
import { Product } from "../../types/product";
import { fetcher } from "../../utils/fetcher";
import useSWR from "swr";
import { useAppStore } from "../../stores/useAppStore";
import { useSearch } from "../../hooks/useSearch";
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
	if (
		product.vendorCode.toLowerCase().includes(lowerSearchValue) ||
		product.code.toLowerCase().includes(lowerSearchValue) ||
		product?.description?.toLowerCase().includes(lowerSearchValue)
	) {
		return true;
	}

	const queryArray = lowerSearchValue.split(" ");
	if (queryArray.every((word) => lowerProductName.includes(word))) {
		return true;
	}

	return false;
}

function createQueryForFTS(searchValue: string) {
	return searchValue
		.trim()
		.replace(/\s+/, " ")
		.split(" ")
		.map((w) => {
			if (parseInt(w)) {
				return w;
			}
			return `(${w} OR ${w}*)`;
		})
		.join(" AND ");
}

type SearchFormProps = {
	setFilteredProducts: any;
};

export default function SearchForm() {
	// const { searchValue } = useAppStore();
	// const [searchValue, setSearchValue] = useState("");
	const [exactSearch, setExactSearch] = useState(false);
	const [onlyInStock, setOnlyInStock] = useState(false);
	const [backendSearch, setBackendSearch] = useState(true);
	const [isLoadingFTS, setIsLoadingFTS] = useState(false);

	const {
		setQuery,
		query,
		isLoading: isLoadingProducts,
		isValidating: isValidatingProducts,
		search,
		history,
		// mutate: refreshProducts,
		// isLoading: isLoadingProducts,
		// isValidating: isValidatingProducts,
	} = useSearch({
		fts: true,
	});
	// console.log("result",result)

	async function filterProducts(e: FormEvent) {
		e.preventDefault();
		search();
		// setFilteredProducts([]);

		// if (backendSearch) {
		// 	setIsLoadingFTS(true);
		// 	const products = await fetcher<Product[]>({
		// 		url: "/shop/hs/api/test",
		// 		method: "GET",
		// 		query: `?q=${createQueryForFTS(searchValue)}`,
		// 	}).finally(() => {
		// 		setIsLoadingFTS(false);
		// 	});
		// 	console.log("BACKEND");
		// 	if (!products) {
		// 		return;
		// 	}
		// 	//@ts-expect-error yeahh
		// 	setFilteredProducts(products.sort((a, b) => a.name > b.name));

		// 	return;
		// }
		// const products = await refreshProducts();
		// const filtered = products
		// 	?.sort(sortProducts)
		// 	.filter((product) =>
		// 		searchThroughProducts(product, searchValue, onlyInStock, exactSearch),
		// 	);
		// if (filtered) {
		// 	setFilteredProducts(filtered);
		// }
	}
	useEffect(() => {
		// if (!searchValue) {
		// 	return;
		// }
		// const filtered = products
		// 	?.sort(sortProducts)
		// 	.filter((product) =>
		// 		searchThroughProducts(product, searchValue, onlyInStock, exactSearch),
		// 	);
		// if (filtered) {
		// 	setFilteredProducts(filtered);
		// }
	}, [onlyInStock, exactSearch]);
	// const {
	// 	data: products,
	// 	mutate: refreshProducts,
	// 	isLoading: isLoadingProducts,
	// 	isValidating: isValidatingProducts,
	// } = useSWR(
	// 	searchValue.length ? "/products/" : null,
	// 	() =>
	// 		fetcher<Product[]>({
	// 			url: "/shop/hs/app/product/",
	// 			method: "GET",
	// 		}),
	// 	{
	// 		revalidateOnFocus: false,
	// 		revalidateOnMount: false,
	// 		revalidateIfStale: false,
	// 		revalidateOnReconnect: false,
	// 	},
	// );

	return (
		<form
			className="row-start-2 col-span-6 flex flex-col"
			onSubmit={filterProducts}
		>
			<div className="flex w-full">
				<input
					className="border-2 w-full h-10 rounded-lg px-2"
					value={query}
					onChange={({ target }) => setQuery(target.value)}
				/>
				<button
					disabled={
						isValidatingProducts || isValidatingProducts || isLoadingFTS
					}
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
						disabled={isValidatingProducts || isLoadingProducts || isLoadingFTS}
					/>
					по коду
				</label>
				<label className="shrink-0 flex gap-2 items-center h-10 mr-2">
					<input
						type="checkbox"
						checked={onlyInStock}
						onChange={() => setOnlyInStock(!onlyInStock)}
						disabled={isValidatingProducts || isLoadingProducts || isLoadingFTS}
					/>
					тільки наявність
				</label>
				<label className="shrink-0 flex gap-2 items-center h-10">
					<input
						type="checkbox"
						checked={backendSearch}
						onChange={() => setBackendSearch(!backendSearch)}
						disabled={isValidatingProducts || isLoadingProducts || isLoadingFTS}
					/>
					тестовий
				</label>
			</div>
			<div className="flex w-full mt-2 overflow-y-auto">
				{history.slice(0,5).map((item) => (
					<button className="mx-1" onClick={()=>setQuery(item)}>{item}</button>
				))}
			</div>
		</form>
	);
}
