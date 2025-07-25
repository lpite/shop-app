import { useState } from "react";
import useSWR from "swr";
import * as Dialog from "@radix-ui/react-dialog";

import { Product } from "../../../types/product";
import { ImportedProduct } from "./types";

import { fetcher } from "../../../utils/fetcher";
import { filterProducts } from "../../../utils/filterProducts";
import { Check } from "lucide-react";

interface ProductSelectorDialogProps {
	selectProduct: (product: Product & { ref: string }, index: number) => void;
	q: string;
	row: ImportedProduct;
	rowIndex: number;
}

export function ProductSelectorDialog({
	selectProduct,
	q,
	row,
	rowIndex,
}: ProductSelectorDialogProps) {
	const [query, setQuery] = useState(q);
	const { data: products } = useSWR("/app/product", () =>
		fetcher<Array<Product & { ref: string }>>({
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
					onClick={() => selectProduct(filteredProducts[0], rowIndex)}
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
								onClick={() => selectProduct(el, rowIndex)}
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
