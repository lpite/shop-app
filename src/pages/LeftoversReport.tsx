import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { useState } from "react";
import { Spinner } from "../components/spinner";
import Show from "../utils/Show";

const headers = [
	"article",
	"oem",
	"name",
	"price",
	"stock",
	"minStock",
] as const;

type Headers = (typeof headers)[number];

type Row = {
	article: string;
	oem: string;
	name: string;
	price: number;
	stock: number;
	minStock: number;
};

export default function LeftoversReport() {
	const [selectedSupplier, setSelectedSupplier] = useState<
		string | undefined
	>();

	const [filters, setFilters] = useState({
		showOnlyNotInStock: false,
	});

	const {
		data: suppliers,
		isLoading: isLoadingSuppliers,
		isValidating: isValidatingSuppliers,
	} = useSWR("/api/suppliers/", () =>
		fetcher<any[]>({
			url: "/shop/hs/api/suppliers",
			method: "GET",
		}),
	);

	const { data, isLoading } = useSWR(
		selectedSupplier
			? "reports/leftovers-by-supplier/" + selectedSupplier
			: null,
		() =>
			fetcher<Row[]>({
				url: "/shop/hs/reports/leftovers-by-supplier/" + selectedSupplier,
				method: "GET",
			}),
	);

	return (
		<main className="flex items-center flex-col w-screen py-2 px-4">
			<div className="flex gap-2 items-center justify-start pb-4 w-full ">
				<div className="flex w-full items-center">
					<label htmlFor="supplier_select">Постачальник:</label>
					<select
						className="py-2 px-4 rounded-lg border-2 bg-white disabled:bg-gray-200"
						onChange={(e) => setSelectedSupplier(e.target.value)}
						disabled={isLoadingSuppliers || isValidatingSuppliers}
						id="supplier_select"
					>
						<option value="">--------</option>
						{suppliers?.map((sp) => (
							<option key={sp["Код"]} value={sp["Код"]}>
								{sp["Наименование"]}
							</option>
						))}
					</select>
					<Show when={isLoading || isLoadingSuppliers}>
						<Spinner size={30} />
					</Show>
					<div className="flex flex-col gap-2 m-2">
						<span>Показувати</span>
						<label className="flex">
							наявність 0{" "}
							<input
								type="checkbox"
								checked={filters.showOnlyNotInStock}
								onChange={() =>
									setFilters((f) => ({
										...f,
										showOnlyNotInStock: !f.showOnlyNotInStock,
									}))
								}
							/>
						</label>
					</div>
				</div>

				<div className="w-full">
					<span className="text-xl w-64 inline-block">
						Недостатньо штучок:
						{data
							?.filter((c) => c["stock"] - c["minStock"] < 0)
							.reduce((p, c) => p + (c["stock"] - c["minStock"]), 0)}
					</span>
					<span className="text-xl w-60 inline-block">
						Сума:
						{data
							?.filter((c) => c["stock"] - c["minStock"] < 0)
							.reduce(
								(p, c) => p + Math.abs(c["stock"] - c["minStock"]) * c["price"],
								0,
							)}
					</span>
				</div>
				<button className="bg-green-300 py-2 px-4 rounded-lg shrink-0">
					Створити документ
				</button>
			</div>
			<table>
				<thead>
					<tr>
						{headers.map((k) => (
							<td className="border p-2" key={k}>
								{k}
							</td>
						))}
						<td className="border p-2">Різниця</td>
					</tr>
				</thead>
				<tbody>
					{data
						?.map((el) => ({
							...el,
							stockDifference: el["stock"] - el["minStock"],
						}))
						.sort((a, b) => a["stockDifference"] - b["stockDifference"])
						.filter((el) => {
							if (filters.showOnlyNotInStock) {
								return el["stock"] === 0;
							}
							return true;
						})
						.map((el) => (
							<Row
								headers={headers as any}
								el={el}
								key={el["name"] + el["article"]}
							/>
						))}
				</tbody>
			</table>
		</main>
	);
}

function Row({ headers, el }: { headers: Headers[]; el: Row }) {
	const [selected, setSelected] = useState(false);
	return (
		<tr className={selected ? "bg-green-200" : ""}>
			{headers.map((k) => (
				<td className="border p-2" key={k + el["name"]}>
					{el[k]}
				</td>
			))}
			<td className="border p-2">{el["stock"] - el["minStock"]}</td>
			<td>
				<button onClick={() => setSelected(!selected)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
					</svg>
				</button>
			</td>
			<td>
				<button onClick={() => setSelected(!selected)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
					</svg>
				</button>
			</td>
		</tr>
	);
}
