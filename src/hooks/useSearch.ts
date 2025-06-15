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

function createQueryForFTS(searchValue: string, exact: boolean) {
	if (exact) {
		return `"${searchValue}"`;
	}

	const queryString = searchValue
		.trim()
		.replace(/\s+/, " ")
		.split(" ")
		.map((w) => {
			if (w.length === 1) {
				// не можна додавати зірочку коли один символ
				return w;
			}

			if (w.match(/\d+мм/g)) {
				return `(${w} OR Ф${w})`;
			}

			if (!isNaN(Number(w[w.length - 1]))) {
				// не можна додавати зірочку в кінець коли останній символ цифра
				return w;
			}
			return `(${w} OR ${w}*)`;
		})
		.join(" AND ");
	if (!queryString.includes("AND")) {
		// перевірка на одне пошукове слово
		// так погана
		return queryString;
	}

	return `(${queryString}) OR ${searchValue.replace(/\s+/g, "")}`;
}

interface UseSearch {
	fts?: boolean;
	exact?: boolean;
}

export function useSearch({ fts = false, exact = false }: UseSearch) {
	// const [query
	const { query, history } = searchStore();
	const { data, mutate, isLoading, isValidating } = useSWR(
		`search`,
		() =>
			fts
				? fetcher<Product[]>({
						url: "/shop/hs/api/test",
						method: "GET",
						query: `?q=${createQueryForFTS(query, exact)}`,
					}).then((r) => r.sort((a, b) => a.name.localeCompare(b.name)))
				: fetcher<Product[]>({
						url: "/shop/hs/app/product/",
						method: "GET",
					}),
		{
			revalidateOnMount: false,
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			errorRetryCount: 0,
		},
	);
	const setQuery = (query: string) => {
		searchStore.setState({ query: query });
	};

	const clearData = () => {
		mutate([], {
			revalidate: false,
		});
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
		data: data || [],
		setQuery,
		search,
		isLoading,
		isValidating,
		history,
		clearData,
	};
}
