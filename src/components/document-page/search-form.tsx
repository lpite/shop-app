import { FormEvent, useEffect, useState } from "react";
import { useSearch } from "../../hooks/useSearch";

export default function SearchForm() {
	const [exactSearch, setExactSearch] = useState(false);
	const [onlyInStock, setOnlyInStock] = useState(false);
	//@TODO виправити пошук по тільки наявним
	const {
		setQuery,
		query,
		isLoading: isLoadingProducts,
		isValidating: isValidatingProducts,
		search,
		history,
	} = useSearch({
		fts: true,
		exact: exactSearch,
	});

	async function filterProducts(e: FormEvent) {
		e.preventDefault();
		search();
	}
	useEffect(() => {
		if (!query) {
			return;
		}
		search();
	
	}, [onlyInStock, exactSearch]);

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
						isValidatingProducts || isValidatingProducts
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
						disabled={isValidatingProducts || isLoadingProducts}
					/>
					точний збіг
				</label>
				<label className="shrink-0 flex gap-2 items-center h-10 mr-2">
					<input
						type="checkbox"
						checked={onlyInStock}
						onChange={() => setOnlyInStock(!onlyInStock)}
						disabled={isValidatingProducts || isLoadingProducts}
					/>
					тільки наявність
				</label>
			</div>
			<div className="flex w-full mt-2 overflow-y-auto">
				{history.slice(0, 5).map((item) => (
					<button className="mx-1" onClick={() => setQuery(item)}>
						{item}
					</button>
				))}
			</div>
		</form>
	);
}
