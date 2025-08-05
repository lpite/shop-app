import { ImportedProduct } from "./types";

const columns = {
	article: "Артикул",
	name: "Назва",
	quantity: "Кількість",
	price: "Ціна",
} as const;

const columnKeys = Object.keys(columns) as (keyof typeof columns)[];

export function parseImportedText(rawText: string) {
	return rawText
		.trim()
		.split("\n")
		.map((line) => {
			const values = line.split("\t");
			const rowObject: ImportedProduct = {
				article: "",
				name: "",
				quantity: "",
				price: "",
			};
			columnKeys.forEach(
				(key, i) => (rowObject[key] = values[i]?.trim() ?? ""),
			);
			return rowObject;
		});
}
