import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { EllipsisVertical, Image } from "lucide-react";

import PhotoViewer from "../photo-viewer";
import { ProductDetailsDialog } from "./product-details-dialog/product-details-dialog-state";

import Show from "../../utils/Show";

import { usePosStore } from "../../stores/pos-store";
import { useCartStore } from "../../stores/cart-store";

import { FTSProduct } from "../../types/product";

const cellStyles = "border px-1 py-2 box-border";

const columns = [
	{
		label: "Код",
		width: "48px",
	},
	{
		label: "Артикул",
		width: "200px",
	},
	{
		label: "Назва",
		width: "100%",
	},
	{
		label: "Виробник",
		width: "150px",
	},
	{
		label: "Ціна",
		width: "79px",
	},
	{
		label: "Наяв.",
		width: "100px",
	},
	{
		label: "Місце 1",
		width: "200px",
	},
	{
		label: "Місце 2",
		width: "200px",
	},
];

type ProductSectionProps = {
	items: FTSProduct[];
	isLoading: boolean;
	error: any;
};

function extractFoundByValue(text: string = "") {
	const indexOfDots = text.indexOf(":");
	const startPos = text.indexOf("<b>");
	const endPos = text.lastIndexOf("</b>");
	// return text;
	if (text.includes("Код")) {
		return text.replace(":", "");
	}
	// if(endPos - startPos > 20){
	// 	const firstEnd = text.indexOf("</b>");
	// 	const lastEnd = text.indexOf("<b>");

	// 	return text.slice(0,indexOfDots) + " " + text.slice(startPos,firstEnd) + " ... "+ text.slice(lastEnd, endPos);

	// }

	return text.slice(0, indexOfDots) + " " + text.slice(startPos, endPos);
}

export default function ProductsSection({
	items,
	isLoading,
	error,
}: ProductSectionProps) {
	const cartHeight = usePosStore((state) => state.cartHeight);
	const addToCart = useCartStore((state) => state.addToCart);

	const [selectedProduct, setSelectedProduct] = useState<
		FTSProduct | undefined
	>();
	const [photo, setPhoto] = useState<string | undefined>();

	function onDoubleClick(product: FTSProduct) {
		addToCart({ ...product, quantity: 1 });
	}

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			let direction = 1;
			if (event.key === "ArrowDown") {
			} else if (event.key === "ArrowUp") {
				direction = -1;
			} else {
				return;
			}

			setSelectedProduct((p) => {
				if (!p) {
					return p;
				}
				if (!items) {
					return p;
				}
				const index = items?.findIndex((el) => el.id === p.id) || 0;
				if (
					(index === items.length - 1 && direction === 1) ||
					(index === 0 && direction === -1)
				) {
					return p;
				}

				return items[index + direction];
			});
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [items]);

	return (
		<div
			className="flex px-2 min-h-0"
			style={{ paddingBottom: `${cartHeight}px` }}
		>
			<div className="flex flex-col overflow-y-auto w-full">
				<PhotoViewer photo={photo} />

				<div className="flex select-none">
					<div className="w-6 shrink-0"></div>
					{columns.map((column) => (
						<Cell key={`cell_${column.label}`} width={column.width}>
							{column.label}
						</Cell>
					))}
				</div>
				{!isLoading && !items.length && !error ? (
					<div className="h-96 flex items-center justify-center select-none">
						<span className="text-3xl">Нічого не знайдено</span>
					</div>
				) : null}
				{error ? (
					<div className="h-96 flex items-center justify-center select-none">
						<span className="text-3xl">Помилка</span>
					</div>
				) : null}
				<div className="overflow-y-auto grow">
					{!isLoading &&
						items?.slice(0, 100)?.map((product, i) => (
							<div
								className={`flex select-none hover:bg-slate-100 ${product.needToSell ? "bg-green-200 hover:bg-green-300" : ""} ${product.id === selectedProduct?.id ? "bg-slate-300 hover:bg-slate-300" : ""}`}
								key={i}
								onDoubleClick={() => onDoubleClick(product)}
								onMouseDown={() => setSelectedProduct(product)}
							>
								<div
									className="w-6 shrink-0 flex items-center justify-center"
									onMouseEnter={() => setPhoto(product.photoPath)}
									onMouseLeave={() => setPhoto(undefined)}
								>
									{product.photo ? (
										<Image className="cursor-pointer size-5" />
									) : null}
								</div>
								<Cell width={columns[0].width}>{product.searchCode}</Cell>
								<Cell
									width={columns[1].width}
									style={{ wordWrap: "break-word" }}
								>
									{product.code}
									<Show when={product.vendorCode.length && product.code.length}>
										<br />
									</Show>
									{product.vendorCode}
								</Cell>
								<Cell width="100%" className="flex flex-col justify-between">
									<div className="flex justify-between">
										{product.name}
										<button
											onClick={() => ProductDetailsDialog.openPopup(product)}
											className="flex w-8 justify-end"
										>
											<EllipsisVertical />
										</button>
									</div>
									<span
										className="text-xs line-clamp-1 text-gray-600 mt-1"
										dangerouslySetInnerHTML={{
											__html: `<span style="display:flex;gap:5px">Знайдено: ${extractFoundByValue(product.foundBy)}</span>`,
										}}
									></span>
								</Cell>
								<Cell width={columns[3].width}>
									<span className="line-clamp-1" title={product.brand}>
										{product.brand}
									</span>
								</Cell>
								<Cell width={columns[4].width}>
									{product.price?.toFixed(2)}
								</Cell>
								<Cell width={columns[5].width}>
									{product.quantity ? (
										<>
											<span className="font-semibold">{product.quantity}</span>{" "}
											{product?.units}
										</>
									) : (
										<span className="text-red-700 font-bold">Немає</span>
									)}
								</Cell>
								<Cell width={columns[6].width}>{product?.place1}</Cell>
								<Cell width={columns[7].width}>
									{product?.place2}
									<Show
										when={
											product?.place3?.length !== 0 &&
											product?.place2?.length !== 0
										}
									>
										<br />
									</Show>
									{product?.place3}
								</Cell>
							</div>
						))}
					{items.length > 100 ? (
						<div className="h-24 flex items-center justify-center text-3xl">
							Запит дуже неточний
						</div>
					) : null}
				</div>
			</div>
			{/*<div className="w-96 border-l-2 p-2"></div>*/}
		</div>
	);
}

type CellProps = {
	children: ReactNode;
	width: string;
	style?: CSSProperties;
	className?: string;
};

function Cell({ children, width, style, className }: CellProps) {
	return (
		<div
			className={`${cellStyles} ${className} ${width.includes("%") ? "shrink" : "shrink-0"}`}
			style={{ width: width, ...style }}
		>
			{children}
		</div>
	);
}
