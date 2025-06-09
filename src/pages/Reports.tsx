import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { useState } from "react";
import { Spinner } from "../components/spinner";
import Show from "../utils/Show";
import { useSearchParams } from "wouter";

const headers = [
	"Артикул",
	"НомерПроизводителя",
	"Наименование",
	"Цена",
	"ВНаличииОстаток",
	"МинЗапас",
];

export default function Reports() {
	// const [selectedSupplier, setSelectedSupplier] = useState<
	// 	string | undefined
	// >();

	const [selected, setSelected] = useState<any[]>([]);

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

	const [searchParams, setSearchParams] = useSearchParams();
	const selectedSupplier = searchParams.get("supplier") || undefined;
	const { data, isLoading } = useSWR(
		selectedSupplier
			? "reports/leftovers-by-supplier/" + selectedSupplier
			: null,
		() =>
			fetcher<any[]>({
				url: "/shop/hs/reports/leftovers-by-supplier/" + selectedSupplier,
				method: "GET",
			}),
		{ revalidateOnMount: false },
	);
	console.log(searchParams);
	return (
		<main className="flex items-center flex-col w-screen py-2 px-4">
			<div className="flex gap-2 items-center justify-start pb-4 w-full ">
				<div className="flex w-full items-center">
					<label htmlFor="supplier_select">Постачальник:</label>
					<select
						className="py-2 px-4 rounded-lg border-2 bg-white disabled:bg-gray-200"
						onChange={(e) => setSearchParams({ supplier: e.target.value })}
						disabled={isLoadingSuppliers || isValidatingSuppliers}
						id="supplier_select"
					>
						<option>--------</option>
						{suppliers?.map((sp, i) => (
							<option key={sp["Код"]} value={sp["Код"]}>
								{sp["Наименование"]}
							</option>
						))}
					</select>
					<Show when={isLoading || isLoadingSuppliers}>
						<Spinner size={8} />
					</Show>
				</div>
				<div className="w-full">
					<span className="text-xl w-64 inline-block">
						Недостатньо штучок:
						{data
							?.filter((c) => c["ВНаличииОстаток"] - c["МинЗапас"] < 0)
							.reduce((p, c) => p + (c["ВНаличииОстаток"] - c["МинЗапас"]), 0)}
					</span>
					<span className="text-xl w-60 inline-block">
						Сума:
						{data
							?.filter((c) => c["ВНаличииОстаток"] - c["МинЗапас"] < 0)
							.reduce(
								(p, c) =>
									p +
									Math.abs(c["ВНаличииОстаток"] - c["МинЗапас"]) * c["Цена"],
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
					</tr>
				</thead>
				<tbody>
					{data
						?.map((el) => ({
							...el,
							Разница: el["ВНаличииОстаток"] - el["МинЗапас"],
						}))
						.sort((a, b) => a["Разница"] - b["Разница"])
						.map((el) => (
							<Row
								headers={headers}
								el={el}
								key={el["Наименование"] + el["Артикул"]}
							/>
						))}
				</tbody>
			</table>
		</main>
	);
}

function Row({ headers, el }: { headers: string[]; el: Record<string, any> }) {
	const [selected, setSelected] = useState(false);
	return (
		<tr className={selected ? "bg-green-200" : ""}>
			{headers.map((k) => (
				<td className="border p-2" key={k + el["Наименование"]}>
					{el[k]}
				</td>
			))}
			<td className="border p-2">{el["ВНаличииОстаток"] - el["МинЗапас"]}</td>
			<td>
				<button onClick={() => setSelected(!selected)}>
					{/*{selected ? "-" : "+"}*/}
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
