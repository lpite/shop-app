import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearch } from "../../hooks/useSearch";
import { Search } from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";

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

	const inputRef = useRef<HTMLInputElement>(null);

	useHotkey("F2", () => {
		inputRef.current?.focus();
	});

	useEffect(() => {
		function listener(e: KeyboardEvent) {
			if (e.key === "Escape" && e.target === inputRef.current) {
				inputRef.current?.blur();
			}
		}
		document.addEventListener("keydown", listener);
		return () => document.removeEventListener("keydown", listener);
	}, []);

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
					ref={inputRef}
				/>
				<button
					disabled={isValidatingProducts || isValidatingProducts || !query}
					className="mx-2 border-2 h-10 px-3 rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:bg-slate-400"
				>
					<Search />
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
				{history.slice(0, 5).map((item, i) => (
					<button
						key={i + item}
						className="mx-1 max-w-48 text-start overflow-y-hidden"
						onClick={() => setQuery(item)}
					>
						<span className="line-clamp-1">{item}</span>
					</button>
				))}
			</div>
		</form>
	);
}
