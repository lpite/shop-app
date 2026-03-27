import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { FormEvent, useState } from "react";
import { EditProductDialog } from "./PlaceChangeSuggestionReport";
import { getOdataValue } from "../utils/odata";
import { Search } from "lucide-react";
import { useStorageCells } from "../api/odata";
import { getStorageCellCode } from "../utils/getStorageCellCode";

export function ProductEditor() {
	const [query, setQuery] = useState("");
	const { data: product } = useSWR(
		query.length ? `odata/catalog/products/${query}` : null,
		() =>
			fetcher<any>({
				url: `/shop/odata/standard.odata/Catalog_Номенклатура?$format=json&$select=Ref_Key,Code,Description,Артикул,МестоХранения_Key,МестоХранения1_Key,МестоХранения2_Key&$filter=КодДляПоиска eq '${query}'`,
				method: "GET",
			})
				.then((r) =>
					getOdataValue<
						{
							Ref_Key: string;
							Code: string;
							Description: string;
							Артикул: string;
							МестоХранения_Key: string;
							МестоХранения1_Key: string;
							МестоХранения2_Key: string;
						}[]
					>(r),
				)
				.then((r) => r[0]),
	);

	const { data: storageCells } = useStorageCells();

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formQuery = formData.get("query")?.toString();
		if (formQuery) {
			setQuery(formQuery);
		}
	}

	return (
		<main className="p-4">
			<form onSubmit={onSubmit} className="w-full flex gap-2">
				<input
					name="query"
					placeholder="Код"
					type="number"
					className="w-full px-3 py-2 rounded-lg"
				/>
				<button className="bg-sky-500 size-10 flex items-center justify-center rounded-lg shrink-0">
					<Search className="size-6" />
				</button>
			</form>
			{product ? (
				<div>
					<div>Артикул: {product.Артикул}</div>
					<div>Name: {product.Description}</div>
					<div>
						Place1:{getStorageCellCode(storageCells, product.МестоХранения_Key)}
					</div>
					<div>
						Place2:
						{getStorageCellCode(storageCells, product.МестоХранения1_Key)}
					</div>
					<div>
						Place3:
						{getStorageCellCode(storageCells, product.МестоХранения2_Key)}
					</div>
					<div className="flex justify-end">
						<EditProductDialog
							product={{
								ref: product.Ref_Key,
								name: product.Description,
								id: product.Code,
								place1: product.МестоХранения_Key,
								place2: product.МестоХранения1_Key,
								place3: product.МестоХранения2_Key,
								stock: 1,
							}}
						/>
					</div>
				</div>
			) : null}
		</main>
	);
}
