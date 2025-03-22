import useSWR from "swr";
import { Product } from "../types/product";
import { fetcher } from "../utils/fetcher";
import { filterProducts } from "../utils/filterProducts";

type UseProducts = {
	query?: string;
	onlyInStock?: boolean;
	exactSearch?: boolean;
};

export function useProducts({
	query = "",
	onlyInStock = false,
	exactSearch = false,
}: UseProducts) {
	const products = useSWR(
		"/products/",
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
	if (query) {
		return {
			...products,
			data: products.data?.filter((product) =>
				filterProducts(product, query, onlyInStock, exactSearch),
			),
		};
	}

	return products;
}
