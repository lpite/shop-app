import { useState } from "react";
import {
	ArrowLeft,
	X,
	Save,
	SquareSplitVertical,
	Trash,
	Trash2,
} from "lucide-react";

import type { Product } from "../../../types/product";
import { useImportStore } from "./use-import-store";
import { ProductSelectorDialog } from "./product-selector-dialog";
import { ImportDialog } from "./import-dialog";
import { useIncomeDocumentHepler } from "../../../stores/income-document-helper-store";
import { ImportedProduct } from "./types";

export function ProductImport() {
	const { importedProducts, setImportedProducts, updateRow } = useImportStore();
	const { setDocumentProducts } = useIncomeDocumentHepler();
	const [dialog, setDialog] = useState(false);

	function selectSuggestedProduct(rowIndex: number, product: Product | null) {
		updateRow(rowIndex, { suggestedProduct: product });
	}

	function splitProductRow(row: ImportedProduct, rowIndex: number) {
		const newImportedProducts: ImportedProduct[] = [
			...(!rowIndex ? [row] : importedProducts.slice(0, rowIndex + 1)),
			{
				...row,
				id: Math.random(),
				name: `Розкоплектування ${row.article}`,
				quantity: "1",
				isSplit: true,
				suggestedProduct: null,
			},
			...importedProducts.slice(rowIndex + 1),
		];

		setImportedProducts(newImportedProducts);
	}

	function deleteProductRow(rowIndex: number) {
		const newImportedProducts: ImportedProduct[] = [
			...importedProducts.slice(0, rowIndex),
			...importedProducts.slice(rowIndex + 1),
		];

		setImportedProducts(newImportedProducts);
	}

	function changeProductQuantity(rowIndex: number, quantity: string) {
		updateRow(rowIndex, { quantity: quantity });
	}

	function changeProductPrice(rowIndex: number, price: string) {
		updateRow(rowIndex, { price: price });
	}

	function toNumber(value: string) {
		return parseFloat(value.replace(",", "."));
	}

	return (
		<div className="flex flex-col flex-1 min-h-0">
			<div className="px-6 py-4 mb-5 border-b border-gray-200">
				<h3 className="text-lg font-medium text-gray-900 flex items-center">
					Імпорт товарів
				</h3>
			</div>
			<div className="mb-2">
				<div className="flex gap-3 mb-6 ">
					<button
						className="flex gap-3 pl-2 pr-3 py-2 border rounded-lg hover:bg-sky-100 disabled:opacity-25 disabled:hover:bg-white"
						onClick={() => {
							const mapped = importedProducts
								.filter((p) => p.suggestedProduct)
								.map((p) => ({
									searchCode: p.suggestedProduct?.searchCode,
									name: p.suggestedProduct?.name || "?",
									quantity: toNumber(p.quantity) || 0,
									supplierPrice: toNumber(p.price) || 0,
									retailPrice: p.suggestedProduct?.price || 0,
									ref: p.suggestedProduct?.ref || "",
								}));

							setDocumentProducts(mapped);
						}}
						disabled={
							!importedProducts.filter((p) => p.suggestedProduct).length
						}
					>
						<Save />
						Зберегти
					</button>
					<ImportDialog dialog={dialog} setDialog={setDialog} />
				</div>
			</div>
			<div className="overflow-y-auto flex-1">
				{importedProducts.map((row, rowIndex) => {
					return (
						<div
							key={row.id}
							className={`relative flex gap-3 items-center border my-1 p-2 rounded-md duration-200 ${row.isSplit ? "mx-2" : ""} ${row.suggestedProduct ? "bg-green-200" : ""}`}
						>
							<div className="">
								{!row.isSplit && (
									<button
										className="hover:bg-gray-300 hover:bg-opacity-50 p-1.5 rounded-lg"
										onClick={() => splitProductRow(row, rowIndex)}
									>
										<SquareSplitVertical />
									</button>
								)}
								{row.isSplit && (
									<button
										className="hover:bg-gray-300 hover:bg-opacity-50 p-1.5 rounded-lg text-red-600"
										onClick={() => deleteProductRow(rowIndex)}
									>
										<Trash2 />
									</button>
								)}
							</div>
							<div className="flex flex-col flex-1">
								<span>{row.article}</span>
								<span>{row.name}</span>
							</div>
							<span className="text-sm flex flex-col">
								Кількість
								<input
									className="text-lg font-medium w-12"
									onChange={(e) =>
										changeProductQuantity(rowIndex, e.target.value)
									}
									min={1}
									value={row.quantity}
								/>
							</span>
							<span className="text-sm flex flex-col">
								Ціна
								<input
									className="text-lg font-medium w-12"
									onChange={(e) => changeProductPrice(rowIndex, e.target.value)}
									value={row.price}
								/>
							</span>
							<ArrowLeft />
							<ProductSelectorDialog
								rowIndex={rowIndex}
								row={row}
								selectProduct={selectSuggestedProduct}
								q={row.article}
							/>
							{row.suggestedProduct && (
								<button
									className="hover:bg-gray-300 hover:bg-opacity-50 p-1 rounded-lg absolute end-2"
									onClick={() => selectSuggestedProduct(rowIndex, null)}
								>
									<X />
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
