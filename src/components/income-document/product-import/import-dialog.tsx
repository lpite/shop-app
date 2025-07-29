import * as Dialog from "@radix-ui/react-dialog";
import { useImportStore } from "./use-import-store";
import { Plus } from "lucide-react";
import { ImportedProduct } from "./types";
import { useState } from "react";

interface ImportDialogProps {
	setDialog: (o: boolean) => void;
	dialog: boolean;
}

const columns = {
	article: "Артикул",
	name: "Назва",
	quantity: "Кількість",
	price: "Ціна",
} as const;

const columnKeys = Object.keys(columns) as (keyof typeof columns)[];

export function ImportDialog({ setDialog, dialog }: ImportDialogProps) {
	const {
		importedProducts,
		rawText,
		setRawText,
		setSuggestedProduct,
		setImportedProducts,
	} = useImportStore();
	const [textareaFocus, setTextareaFocus] = useState(false);

	return (
		<Dialog.Root onOpenChange={setDialog} open={dialog}>
			<Dialog.Trigger className="flex gap-3 pl-2 pr-3 py-2 border rounded-lg hover:bg-gray-100">
				<Plus />
				Додати товари
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="flex flex-col fixed w-3/6 min-h-96 h-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
					<Dialog.Title className="text-2xl pb-3 font-medium">
						Імпорт товарів з приходу
					</Dialog.Title>
					<div className="flex py-2">
						<label
							className={`flex-1 h-24 cursor-pointer border-2 ${textareaFocus && "border-sky-500 bg-gray-100"} rounded-lg flex items-center justify-center duration-300`}
						>
							<div className="absolute flex items-center justify-center">
								<span
									className={`w-36 text-center text-lg font-medium duration-200 absolute ${textareaFocus ? "opacity-100 delay-100" : "opacity-0"}`}
								>
									Встав текст
								</span>
								<span
									className={`text-lg font-medium duration-200 absolute ${!textareaFocus ? "opacity-100 delay-100" : "opacity-0 "}`}
								>
									Натисни
								</span>
							</div>
							<textarea
								value={rawText}
								onChange={(e) => setRawText(e.target.value)}
								className="resize-none opacity-0 w-full h-full cursor-pointer"
								onFocus={() => setTextareaFocus(true)}
								onBlur={() => setTextareaFocus(false)}
							></textarea>
						</label>
						<button
							onClick={() => setRawText("")}
							className={`duration-500 h-24 border-2 rounded-lg ml-2 ${!rawText.length ? "w-0 px-0 ml-0 border-transparent border-none" : " w-32"}`}
						>
							<span
								className={
									!rawText.length
										? "opacity-0 duration-100"
										: "opacity-100 duration-500 delay-200"
								}
							>
								Очистити
							</span>
						</button>
					</div>
					<div className="flex-1 overflow-y-auto">
						<table
							className={`h-24 my-2 w-full ${!rawText && "opacity-0 duration-0"} duration-300`}
						>
							<thead>
								<tr>
									{Object.values(columns).map((col) => (
										<th key={"table_head_" + col} className="border px-2">
											{col}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								<tr>
									{rawText
										.split("\n")[0]
										.split("\t")
										.map((el, i) => (
											<td key={"table_body_" + i} className="border px-2">
												{el}
											</td>
										))}
								</tr>
							</tbody>
						</table>
					</div>
					<button
						className="bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 px-3 py-2 rounded-lg duration-200"
						disabled={!rawText.length}
						onClick={() => {
							setImportedProducts(
								rawText
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
									}),
							);
							setDialog(false);
						}}
					>
						Імортувати
					</button>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
