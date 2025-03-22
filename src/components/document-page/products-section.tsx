import { RefObject, useState } from "react";
import { useAppStore } from "../../stores/useAppStore";
import { Product } from "../../types/product";
import PhotoViewer from "../photo-viewer";
import { State } from "./product-details/state";

const cellStyles = "border p-1 shrink-0 box-border";
const columnsWidth = [48, 200, 0, 79, 60, 80, 200, 200, 200];

type ProductSectionProps = {
	pageRef: RefObject<HTMLDivElement>;
	isValidatingProducts: boolean;
	isLoadingProducts: boolean;
	filteredProducts: Product[];
};

export default function ProductsSection({
	pageRef,
	filteredProducts,
	isValidatingProducts,
	isLoadingProducts,
}: ProductSectionProps) {
	const cartHeight = useAppStore((state) => state.cartHeight);
	const addToCart = useAppStore((state) => state.addToCart);

	const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
	const [photo, setPhoto] = useState<string | undefined>();

	function onDoubleClick(product: Product) {
		addToCart({ ...product, quantity: 1 });
	}

	return (
		<div
			className="px-1 flex flex-col"
			style={{ height: `calc(100% - ${cartHeight - 10}px)` }}
		>
			<PhotoViewer photo={photo} />

			<div className="flex select-none">
				<div className="w-6 shrink-0"></div>
				<div style={{ width: columnsWidth[0] }} className={cellStyles}>
					Код
				</div>
				<div style={{ width: columnsWidth[1] }} className={cellStyles}>
					Артикул
				</div>
				<div
					style={{
						width:
							(pageRef.current?.clientWidth || 0) -
							columnsWidth.reduce((prev, el) => prev + el, 0) -
							26,
					}}
					className={cellStyles}
				>
					Назва
				</div>
				<div style={{ width: columnsWidth[3] }} className={cellStyles}>
					Ціна
				</div>
				<div style={{ width: columnsWidth[4] }} className={cellStyles}>
					Наяв
				</div>
				<div style={{ width: columnsWidth[5] }} className={cellStyles}>
					Одн-ці
				</div>
				<div style={{ width: columnsWidth[6] }} className={cellStyles}>
					Місце 1
				</div>
				<div style={{ width: columnsWidth[7] }} className={cellStyles}>
					Місце 2
				</div>
				<div style={{ width: columnsWidth[8] }} className={cellStyles}>
					Місце 3
				</div>
			</div>
			{isValidatingProducts && !isLoadingProducts ? (
				<div className="h-full w-full flex items-center justify-center ">
					<img className="octocat" src="/octocat.gif" height={40} width={40} />
				</div>
			) : null}
			{!isValidatingProducts &&
			!isLoadingProducts &&
			!filteredProducts.length ? (
				<div className="h-full w-full flex items-center justify-center">
					<span className="text-3xl">Нічого не знайдено</span>
				</div>
			) : null}
			<div style={{ overflowY: "auto", flexGrow: 1 }}>
				{!isValidatingProducts &&
					filteredProducts?.slice(0, 100)?.map((product, i) => (
						<div
							className={`flex select-none ${product.searchCode === selectedProduct ? "bg-slate-300" : ""}`}
							key={i}
							onDoubleClick={() => onDoubleClick(product)}
							onMouseDown={() => setSelectedProduct(product.searchCode)}
							onContextMenu={(e) => e.preventDefault()}
						>
							<div
								className="w-6 shrink-0 flex items-center"
								onMouseEnter={() => setPhoto(product.photoPath)}
								onMouseLeave={() => setPhoto(undefined)}
							>
								{product.photo ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										viewBox="0 0 16 16"
										className="cursor-pointer"
									>
										<path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
										<path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z" />
									</svg>
								) : null}
							</div>
							<div style={{ width: columnsWidth[0] }} className={cellStyles}>
								{product.searchCode}
							</div>
							<div style={{ width: columnsWidth[1] }} className={cellStyles}>
								{product.code}
								<br />
								{product.vendorCode}
							</div>
							<div
								style={{
									width:
										(pageRef.current?.clientWidth || 0) -
										columnsWidth.reduce((prev, el) => prev + el, 0) -
										26,
								}}
								className={cellStyles + " flex justify-between"}
							>
								{product.name}
								{product?.description?.length ? (
									<button onClick={() => State.openPopup(product)}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											viewBox="0 0 16 16"
										>
											<path
												fillRule="evenodd"
												d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
											/>
										</svg>
									</button>
								) : null}
							</div>
							<div style={{ width: columnsWidth[3] }} className={cellStyles}>
								{product.price.toFixed(2)}
							</div>
							<div style={{ width: columnsWidth[4] }} className={cellStyles}>
								{product.quantity || (
									<span className="text-red-700 font-bold">Немає</span>
								)}
							</div>
							<div style={{ width: columnsWidth[5] }} className={cellStyles}>
								{product?.units}
							</div>
							<div style={{ width: columnsWidth[6] }} className={cellStyles}>
								{product?.place1}
							</div>
							<div style={{ width: columnsWidth[7] }} className={cellStyles}>
								{product?.place2}
							</div>
							<div style={{ width: columnsWidth[8] }} className={cellStyles}>
								{product?.place3}
							</div>
						</div>
					))}
				{filteredProducts.length > 100 ? (
					<div className="h-24 flex items-center justify-center text-3xl">
						Запит дуже неточний
					</div>
				) : null}
			</div>
		</div>
	);
}
