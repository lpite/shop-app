import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { Product } from "../types/product";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import { getBarcodeProductLinks } from "../api/odata";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

export default function ReceivingPage() {
	const [showPopup, setShowPopup] = useState(false);
	const { data: document } = useSWR("document/1", () =>
		fetcher({
			method: "GET",
			url: "/shop/odata/standard.odata/Document_ПоступлениеТоваровУслуг?$format=json&$top=1&$orderby=Date desc&$filter=Партнер_Key eq guid'de02acb6-3f25-11e5-828e-d850e6d10163'",
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

	return (
		<main className="px-2">
			<QuantityChangePopup
				showPopup={showPopup}
				setShowPopup={setShowPopup}
				label="Зміна кількості надходження"
				oldValue={0}
				setNewValue={(v) => console.log(v)}
			/>
			<h1>Приймання</h1>
			{document?.Date}
			{document?.Товары.map((row) => (
				<ProductCard
					key={row.Номенклатура_Key}
					row={row}
					products={products}
					barcodeProducts={barcodeProducts}
					setShowPopup={setShowPopup}
				/>
			))}
		</main>
	);
}

type ProductCardProps = {
	row: any;
	products: any;
	barcodeProducts: any;
	setShowPopup: (v: boolean) => void;
};

function ProductCard({
	row,
	products,
	barcodeProducts,
	setShowPopup,
}: ProductCardProps) {
	const product = products?.find((el) => el.ref === row.Номенклатура_Key);
	return (
		<div
			className={`flex flex-col gap-2 border-2 rounded-lg mt-2 p-2 ${barcodeProducts.includes(row.Номенклатура_Key) ? "bg-fuchsia-100" : ""}`}
		>
			<div className="flex gap-2">
				<span>№{row.LineNumber}</span>
				<span className="font-medium">{product?.searchCode}</span>
			</div>
			<div className="flex gap-2">
				<span className="text-xl">{product?.name}</span>
				<span className="font-semibold">{product?.code}</span>
			</div>
			<div className="flex border-b-2">
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
					<span className="text-xl">{product?.quantity}</span>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				<button className="border-2 flex-1" onClick={() => setShowPopup(true)}>
					Проблема надходження
				</button>
				<button className="border-2 flex-1">Проблема наявність</button>
				<button className="w-full bg-green-400 py-2 rounded-lg mt-6">
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
	showPopup: boolean;
	setShowPopup: (v: boolean) => void;
};

function QuantityChangePopup({
	label,
	oldValue,
	setNewValue,
	showPopup,
	setShowPopup,
}: QuantityChangePopupProps) {
	return (
		<Dialog.Root open={showPopup} onOpenChange={setShowPopup}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-75" />
				<Dialog.Content className="fixed w-11/12 h-5/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pb-4 rounded-lg">
					<Dialog.Title className="text-xl bg-gray-100 pl-4 pt-4 pb-4 rounded-lg">{label}</Dialog.Title>
				</Dialog.Content>
				<div>
					{oldValue}
				</div>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
