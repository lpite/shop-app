import useSWR from "swr";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fetcher } from "../utils/fetcher";
import { FTSProduct } from "../types/product";
import { useConfig } from "../stores/config-store";

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
export function useSearchV1({ exact = false }: UseSearch) {
	const { query, history } = useSearchStore();

	const { data, mutate, isLoading, isValidating, error } = useSWR(
		`search`,
		() => {
			const currentQuery = useSearchStore.getState().query;
			return fetcher<FTSProduct[]>({
				url: "/shop/hs/api/test",
				method: "GET",
				query: `?q=${createQueryForFTS(currentQuery, exact)}`,
			}).then((r) => r.sort((a, b) => a.name.localeCompare(b.name)));
		},
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
		const currentQuery = useSearchStore.getState().query;
		if (!currentQuery.length) {
			return;
		}

		if (history[0] !== currentQuery) {
			useSearchStore.setState({
				history: [currentQuery, ...history.slice(0, 10)],
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

export function useSearch({ exact = false }: UseSearch) {
	const { use_search_v3 } = useConfig.getState();

	if (use_search_v3) {
		return useSearchV3({ exact });
	}

	return useSearchV2({ exact });
}

function useSearchV2({ exact = false }: UseSearch) {
	const { query, history } = useSearchStore();

	const { data, mutate, isLoading, isValidating, error } = useSWR(
		`search`,
		async () => {
			const currentQuery = useSearchStore.getState().query;
			const r = await fetcher<FTSProduct[]>({
				url: "/shop/hs/api/search",
				method: "GET",
				query: `?q=${createQueryForFTS(currentQuery, exact)}`,
			});
			return r.sort((a, b) => a.name.localeCompare(b.name));
		},
		{
			revalidateOnMount: false,
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			errorRetryCount: 0,
		},
	);
	const setQuery = (query: string) => {
		useSearchStore.setState({ query });
	};

	const clearData = () => {
		mutate([], {
			revalidate: false,
		});
	};

	const search = () => {
		const currentQuery = useSearchStore.getState().query;
		if (!currentQuery.length) {
			return;
		}

		if (history[0] !== currentQuery) {
			useSearchStore.setState({
				history: [currentQuery, ...history.slice(0, 10)],
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

type FTSProductV3 = FTSProduct & {
	analogs: string[];
	oeNumbers: string[];
};

function useSearchV3({}: UseSearch) {
	const { server_url } = useConfig.getState();

	const { query, history } = useSearchStore();

	const { data, mutate, isLoading, isValidating, error } = useSWR(
		`search`,
		() =>
			fetch(`${server_url}/search?q=${query}`)
				.then((r) => r.json() as Promise<FTSProductV3[]>)
				.then((r) => r.sort((a, b) => a.name.localeCompare(b.name))),
		{
			revalidateOnMount: false,
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			errorRetryCount: 0,
		},
	);
	const setQuery = (query: string) => {
		useSearchStore.setState({ query });
	};

	const clearData = () => {
		mutate([], {
			revalidate: false,
		});
	};

	const search = () => {
		if (!query.length) {
			return;
		}

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
