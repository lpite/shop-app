import { useState } from "react";
import { ArrowLeft, X, Save } from "lucide-react";

import type { Product } from "../../../types/product";
import { useImportStore } from "./use-import-store";
import { ProductSelectorDialog } from "./product-selector-dialog";
import { ImportDialog } from "./import-dialog";

interface ProductImportProps {
	setDocumentProducts: (products: any[]) => void;
}

export function ProductImport({ setDocumentProducts }: ProductImportProps) {
	const { importedProducts, setImportedProducts } = useImportStore();
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
		<>
			<div className="mb-2">
				<div className="flex gap-3 mb-6 ">
					<button
						className="flex gap-3 pl-2 pr-3 py-2 border rounded-lg disabled:bg-gray-200 disabled:text-gray-400"
						onClick={() => {
							const mapped = importedProducts
								.filter((p) => p.suggestedProduct)
								.map((p) => ({
									searchCode: p.suggestedProduct?.searchCode,
									name: p.suggestedProduct?.name,
									quantity: parseFloat(p.quantity.replace(",", ".")) || 0,
									price: parseFloat(p.price.replace(",", ".")) || 0,
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
			{importedProducts.map((row, rowIndex) => {
				return (
					<div
						key={row["article"] + row["name"]}
						className={`flex gap-3 items-center border my-1 p-2 rounded-md duration-200 ${row.suggestedProduct ? "bg-green-200" : ""}`}
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
								className="hover:bg-gray-300 hover:bg-opacity-50 p-1 rounded-lg absolute end-6"
								onClick={() => selectSuggestedProduct(null, rowIndex)}
							>
								<X />
							</button>
						)}
					</div>
				);
			})}
		</>
	);
}

// interface ProductSelectorDialogProps {
// 	selectProduct: (product: Product & { ref: string }, index: number) => void;
// 	q: string;
// 	row: ImportedProduct;
// 	rowIndex: number;
// }

// function ProductSelectorDialog({
// 	selectProduct,
// 	q,
// 	row,
// 	rowIndex,
// }: ProductSelectorDialogProps) {
// 	const [query, setQuery] = useState(q);
// 	const { data: products } = useSWR("/app/product", () =>
// 		fetcher<Array<Product & { ref: string }>>({
// 			url: "/shop/hs/app/product/",
// 			method: "GET",
// 		}),
// 	);
// 	const filteredProducts =
// 		products?.filter((el) => filterProducts(el, query, false, false)) || [];
// 	return (
// 		<Dialog.Root>
// 			<div className="flex-1">
// 				<Dialog.Trigger className="flex mr-6">
// 					<span className="flex flex-col items-start">
// 						<span className="">
// 							{row.suggestedProduct && row.suggestedProduct?.code}
// 							{filteredProducts?.length === 1 &&
// 								!row.suggestedProduct &&
// 								filteredProducts[0].code}
// 						</span>
// 						<span
// 							className="text-start line-clamp-1"
// 							title={row.suggestedProduct?.name}
// 						>
// 							{row.suggestedProduct && row.suggestedProduct.name}
// 							{filteredProducts?.length === 1 &&
// 								!row.suggestedProduct &&
// 								filteredProducts[0].name}
// 							{!filteredProducts.length && "Обери"}
// 							{filteredProducts.length > 1 &&
// 								!row.suggestedProduct &&
// 								"Декілька варіантів (обери)"}
// 						</span>
// 					</span>
// 				</Dialog.Trigger>
// 			</div>
// 			{filteredProducts.length === 1 && !row.suggestedProduct ? (
// 				<button
// 					className="hover:bg-gray-300 hover:bg-opacity-50 p-1 rounded-lg absolute end-6"
// 					onClick={() => selectProduct(filteredProducts[0], rowIndex)}
// 				>
// 					<Check />
// 				</button>
// 			) : null}

// 			<Dialog.Portal>
// 				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
// 				<Dialog.Content className="flex flex-col fixed h-5/6 min-h-96 w-4/6 min-w-96 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
// 					<Dialog.Title className="text-2xl pb-3 font-medium">
// 						Обери товар
// 					</Dialog.Title>
// 					<input
// 						className="border px-1 py-2 rounded-lg"
// 						value={query}
// 						onChange={(e) => setQuery(e.target.value)}
// 					/>
// 					<div className="flex flex-col flex-1 overflow-y-auto">
// 						{filteredProducts?.map((el) => (
// 							<button
// 								key={el.searchCode}
// 								className="flex gap-3"
// 								onClick={() => selectProduct(el, rowIndex)}
// 							>
// 								<span>{el.code}</span>
// 								<span>{el.name}</span>
// 								<span>{el.brand}</span>
// 							</button>
// 						))}
// 					</div>
// 				</Dialog.Content>
// 			</Dialog.Portal>
// 		</Dialog.Root>
// 	);
// }
