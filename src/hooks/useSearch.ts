import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { FTSProduct } from "../types/product";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useConfig } from "../stores/configStore";

export const useSearchStore = create<{ query: string; history: string[] }>()(
	persist(
		(_) => ({
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
				return `(${w} OR Ф${w} OR М${w})`;
			}

			if (w.match(/Ф\d+/gi)) {
				return `(${w} OR Ф${w}мм)`;
			}

			// if (!isNaN(Number(w[w.length - 1])) && w.length < 3) {
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

function createQueryForPB(searchValue: string, exact: boolean) {
	const queryString = searchValue
		.trim()
		.replace(/\s+/, " ")
		.split(" ")
		.map((el) => `'${el}'`)
		.join(" && for_search ~ ");
		console.log(queryString)
	return queryString;
}

interface UseSearch {
	fts?: boolean;
	exact?: boolean;
}

/**
 * @param {number} [fts] - do not use
 * @deprecated fts
 */

export function useSearch({ exact = false }: UseSearch) {
	const { use_pocket_base_search } = useConfig();
	const { query, history } = useSearchStore();
	const { data, mutate, isLoading, isValidating, error } = useSWR(
		`search`,
		() =>
			fetcher<FTSProduct[]>({
				url: "/shop/hs/api/test",
				method: "GET",
				query: use_pocket_base_search
					? `?filter=for_search ~ ${createQueryForPB(query, exact)}&perPage=120`
					: `?q=${createQueryForFTS(query, exact)}`,
			}).then((r) => r.sort((a, b) => a.name.localeCompare(b.name))),
		{
			revalidateOnMount: false,
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			errorRetryCount: 0,
		},
	);
	const setQuery = (query: string) => {
		useSearchStore.setState({ query: query });
	};

	const clearData = () => {
		mutate([], {
			revalidate: false,
		});
	};

	const search = () => {
		if (history[0] !== query) {
			useSearchStore.setState({
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
		error,
	};
}
