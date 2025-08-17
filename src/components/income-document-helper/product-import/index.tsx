import { useState } from "react";
import { ArrowLeft, X, Save } from "lucide-react";

import type { Product } from "../../../types/product";
import { useImportStore } from "./use-import-store";
import { ProductSelectorDialog } from "./product-selector-dialog";
import { ImportDialog } from "./import-dialog";
import { useIncomeDocumentHepler } from "../../../stores/income-document-helper-store";

export function ProductImport() {
	const { importedProducts, setImportedProducts } = useImportStore();
	const { setDocumentProducts } = useIncomeDocumentHepler();
	const [dialog, setDialog] = useState(false);

	function selectSuggestedProduct(product: Product | null, index: number) {
		const newImportedProducts = [...importedProducts];
		newImportedProducts[index] = {
			...newImportedProducts[index],
			suggestedProduct: product,
		};
		setImportedProducts(newImportedProducts);
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
									quantity: parseFloat(p.quantity.replace(",", ".")) || 0,
									supplierPrice: parseFloat(p.price.replace(",", ".")) || 0,
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
							key={row["article"] + row["name"]}
							className={`relative flex gap-3 items-center border my-1 p-2 rounded-md duration-200 ${row.suggestedProduct ? "bg-green-200" : ""}`}
						>
							<div className="flex flex-col flex-1">
								<span>{row["article"]}</span>
								<span>{row["name"]}</span>
							</div>
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
									onClick={() => selectSuggestedProduct(null, rowIndex)}
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
