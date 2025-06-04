import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { Product } from "../types/product";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const searchStore = create<{ query: string; history: string[] }>()(
	persist(
		(set) => ({
			query: "",
			history: [],
		}),
		{
			name: "search",
		},
	),
);

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

interface UseSearch {
	fts?: boolean;
}

export function useSearch({ fts = false }: UseSearch) {
	// const [query
	const { query, history } = searchStore();
	const { data, mutate, isLoading, isValidating } = useSWR(
		`search`,
		() =>
			fts
				? fetcher<Product[]>({
						url: "/shop/hs/api/test",
						method: "GET",
						query: `?q=${createQueryForFTS(query)}`,
					})
				: fetcher<Product[]>({
						url: "/shop/hs/app/product/",
						method: "GET",
					}),
		{
			revalidateOnMount: false,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
	const setQuery = (query: string) => {
		searchStore.setState({ query: query });
	};

	const search = () => {
		if (history[0] !== query) {
			searchStore.setState({
				history: [query, ...history.slice(0, 10)],
			});
		}
		mutate();
	};

	return {
		query,
		data,
		setQuery,
		search,
		isLoading,
		isValidating,
		history,
	};
}
