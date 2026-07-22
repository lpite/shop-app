import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { Product } from "../types/product";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import { getBarcodeProductLinks } from "../api/odata";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { create } from "zustand";

type ReceivingStore = {
	popup: boolean;
	popupState: {
		oldQuantity: number;
		newQuantity: number;
		type: "income" | "current";
	};
	corrections: {
		ref: string;
		type: "income" | "current";
		quantity: number;
	}[];
	doneRows: number;
};

const useReceivingStore = create<ReceivingStore>()((s) => ({
	popup: false,
	corrections: [],
	popupState: {
		newQuantity: 0,
		oldQuantity: 0,
		type: "income",
	},
	doneRows: 0,
}));

const setShowPopup = (v: boolean) => useReceivingStore.setState({ popup: v });

export default function ReceivingPage() {
	// const [showPopup, setShowPopup] = useState(false);
	const { data: document } = useSWR("document/1", () =>
		fetcher({
			method: "GET",
			url: "/shop/odata/standard.odata/Document_ПоступлениеТоваровУслуг?$format=json&$top=1&$orderby=Date desc",
		}).then((r) => r.value[0]),
	);

	const { data: products } = useSWR("/app/product", () =>
		fetcher<Product[]>({
			url: "/shop/hs/app/product/",
			method: "GET",
		}),
	);

	const [barcodeProducts, setBarcodeProducts] = useState<string[]>([]);

	useBarcodeScanner(async (barcode) => {
		const barcodeProducts = await getBarcodeProductLinks(barcode);
		setBarcodeProducts(barcodeProducts.map((el) => el.Номенклатура_Key));
	});

	const { doneRows } = useReceivingStore();

	return (
		<main className="px-2 pt-12">
			<QuantityChangePopup
				label="Зміна кількості надходження"
				oldValue={0}
				setNewValue={(v) => console.log(v)}
			/>
			<div className="fixed top-0 left-0 bg-gray-100 flex gap-2 w-full p-2 border-b-2">
				<h1>Приймання</h1>
				<span>{document?.Date}</span>
				<span>Зроблено: {doneRows}</span>
			</div>
			{document?.Товары.map((row: unknown) => (
				<ProductCard
					key={row.Номенклатура_Key}
					row={row}
					products={products}
					barcodeProducts={barcodeProducts}
				/>
			))}
		</main>
	);
}

type ProductCardProps = {
	row: any;
	products: any;
	barcodeProducts: any;
};

function ProductCard({ row, products, barcodeProducts }: ProductCardProps) {
	const product = products?.find(
		(el: { ref: any }) => el.ref === row.Номенклатура_Key,
	);
	const [done, setDone] = useState(false);
	function openPopup(type: "income" | "current") {
		setShowPopup(true);
		useReceivingStore.setState({
			popupState: {
				newQuantity: product?.quantity,
				oldQuantity: product?.quantity,
				type: type,
			},
		});
	}

	return (
		<div
			className={`flex flex-col gap-2 border-2 rounded-lg mt-2 p-2 ${done ? "bg-green-200 opacity-25" : ""} ${barcodeProducts.includes(row.Номенклатура_Key) ? "bg-fuchsia-100" : ""}`}
		>
			<div className="flex gap-2">
				<span>№{row.LineNumber}</span>
				<span className="font-medium flex-1">{product?.searchCode}</span>
				<span className="font-semibold">{product?.code}</span>
			</div>
			<div className="flex gap-2">
				<span className="text-xl">{product?.name}</span>
			</div>
			<div className="flex border-b-2 h-14">
				<div className="flex flex-col flex-1">
					<span className="text-gray-700 text-sm">Місце</span>
					<span className="">{product?.place1}</span>
				</div>
				<div className="flex flex-col flex-1">
					<span className="text-gray-700 text-sm">Місце</span>
					<span className="">
						{product?.place2} {product?.place3}
					</span>
				</div>
			</div>
			<div className="flex flex-row gap-2">
				<div className="flex flex-col flex-1">
					<span className="text-gray-700 text-sm">Надходження</span>
					<span className="text-xl">{row.Количество}</span>
				</div>
				<div className="flex flex-col flex-1">
					<span className="text-gray-700 text-sm">В наявності</span>
					<span className="text-xl">{product?.quantity - row.Количество}</span>
				</div>
				<div className="flex flex-col flex-1">
					<span className="text-gray-700 text-sm">Загалом</span>
					<span className="text-xl">{product?.quantity}</span>
				</div>
			</div>
			<div></div>
			<div className="flex flex-wrap gap-2">
				<button
					className="border-2 flex-1 rounded-xl"
					onClick={() => {
						setShowPopup(true);
						useReceivingStore.setState({
							popupState: {
								newQuantity: row.Количество,
								oldQuantity: row.Количество,
								type: "income",
							},
						});
					}}
				>
					Проблема надходження
				</button>
				<button
					className="border-2 rounded-xl flex-1"
					onClick={() => openPopup("current")}
				>
					Проблема наявність
				</button>
				<button
					className="w-full bg-green-400 py-2 rounded-lg mt-6"
					onClick={() => {
						setDone(!done);
					}}
				>
					Все ок
				</button>
			</div>
		</div>
	);
}

type QuantityChangePopupProps = {
	label: string;
	oldValue: number;
	setNewValue: (v: number) => void;
};

function QuantityChangePopup({}: QuantityChangePopupProps) {
	const { popup, popupState } = useReceivingStore();

	return (
		<Dialog.Root open={popup} onOpenChange={setShowPopup}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-75" />
				<Dialog.Content className="fixed w-11/12 h-5/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pb-4 rounded-lg flex flex-col">
					<Dialog.Title className="text-xl bg-gray-100 pl-4 pt-4 pb-4 rounded-lg">
						{popupState.type === "income"
							? "Зміна кількості надходження"
							: "Зміна кількості наявності"}
					</Dialog.Title>
					<div className="flex flex-col h-full">
						<div className="flex flex-col px-2 border-b-2 py-2">
							<span>
								{popupState.type === "income"
									? "Мало прийти"
									: "Мало бути в наявності"}
							</span>
							<span className="text-3xl">{popupState.oldQuantity}</span>
						</div>
						<div className="flex flex-col px-2 pt-3">
							<span>
								{popupState.type === "income" ? "Прийшло" : "В наявності"}
							</span>
							<input
								type="number"
								value={popupState.newQuantity}
								onChange={(e) =>
									useReceivingStore.setState((s) => ({
										popupState: {
											...s.popupState,
											newQuantity: parseInt(e.target.value),
										},
									}))
								}
								className="text-3xl border-2"
							/>
						</div>
						<div className="w-full flex gap-3 p-2">
							<button
								onClick={() => setShowPopup(false)}
								className="border-2 rounded-lg flex-1 py-3"
							>
								Скасувати
							</button>
							<button className="border-2 rounded-lg flex-1 py-3 bg-sky-500">
								Зберегти
							</button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
