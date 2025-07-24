import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../../utils/fetcher";
import { ArrowLeft, Check, Save, X } from "lucide-react";
import { filterProducts } from "../../../utils/filterProducts";
import type { Product } from "../../../types/product";
import { ImportedProduct } from "./types";
import { ImportDialog } from "./import-dialog";
import { useImportStore } from "./use-import-store";

interface ProductImportProps {
	setDocumentProducts: (products: any[]) => void;
}

export function ProductImport({ setDocumentProducts }: ProductImportProps) {
	const { importedProducts, setImportedProducts } = useImportStore();
	const [dialog, setDialog] = useState(false);

	function selectSuggestedProduct(product: Product | null, index: number) {
		setImportedProducts(
			importedProducts.map((el, i) => {
				if (i === index) {
					return {
						...el,
						suggestedProduct: product,
					};
				}
				return el;
			}),
		);
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
									productName: p.suggestedProduct?.name,
									quantity: parseFloat(p.quantity.replace(",", ".")) || 0,
									price: parseFloat(p.price.replace(",", ".")) || 0,
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
						key={rowIndex}
						className={`flex gap-3 items-center border my-1 p-2 rounded-md duration-200 ${row.suggestedProduct ? "bg-green-200" : ""}`}
					>
						<div className="flex flex-col flex-1">
							<span>{row["article"]}</span>
							<span>{row["name"]}</span>
						</div>
						<ArrowLeft />
						<ProductSelectorDialog
							row={row}
							selectProduct={(product) =>
								selectSuggestedProduct(product, rowIndex)
							}
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

interface ProductSelectorDialogProps {
	selectProduct: (product: Product) => void;
	q: string;
	row: ImportedProduct;
}

function ProductSelectorDialog({
	selectProduct,
	q,
	row,
}: ProductSelectorDialogProps) {
	const [query, setQuery] = useState(q);
	const { data: products } = useSWR("/app/product", () =>
		fetcher<Product[]>({
			url: "/shop/hs/app/product/",
			method: "GET",
		}),
	);
	const filteredProducts =
		products?.filter((el) => filterProducts(el, query, false, false)) || [];
	return (
		<Dialog.Root>
			<div className="flex-1">
				<Dialog.Trigger className="flex mr-6">
					<span className="flex flex-col items-start">
						<span className="">
							{row.suggestedProduct && row.suggestedProduct?.code}
							{filteredProducts?.length === 1 &&
								!row.suggestedProduct &&
								filteredProducts[0].code}
						</span>
						<span
							className="text-start line-clamp-1"
							title={row.suggestedProduct?.name}
						>
							{row.suggestedProduct && row.suggestedProduct.name}
							{filteredProducts?.length === 1 &&
								!row.suggestedProduct &&
								filteredProducts[0].name}
							{!filteredProducts.length && "Обери"}
							{filteredProducts.length > 1 &&
								!row.suggestedProduct &&
								"Декілька варіантів (обери)"}
						</span>
					</span>
				</Dialog.Trigger>
			</div>
			{filteredProducts.length === 1 && !row.suggestedProduct ? (
				<button
					className="hover:bg-gray-300 hover:bg-opacity-50 p-1 rounded-lg absolute end-6"
					onClick={() => selectProduct(filteredProducts[0])}
				>
					<Check />
				</button>
			) : null}

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="flex flex-col fixed h-5/6 min-h-96 w-4/6 min-w-96 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
					<Dialog.Title className="text-2xl pb-3 font-medium">
						Обери товар
					</Dialog.Title>
					<input
						className="border px-1 py-2 rounded-lg"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<div className="flex flex-col flex-1 overflow-y-auto">
						{filteredProducts?.map((el) => (
							<button
								key={el.searchCode}
								className="flex gap-3"
								onClick={() => selectProduct(el)}
							>
								<span>{el.code}</span>
								<span>{el.name}</span>
								<span>{el.brand}</span>
							</button>
						))}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
