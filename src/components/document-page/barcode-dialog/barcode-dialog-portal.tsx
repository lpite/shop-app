import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { BarcodeDialog } from "./barcode-dialog-state";
import { getBarcodeProductLinks } from "../../../api/odata";
import useSWR from "swr";
import { Product } from "../../../types/product";
import { fetcher } from "../../../utils/fetcher";
import { useCartStore } from "../../../stores/cart-store";

export function BarcodeDialogPortal() {
	const [open, setOpen] = useState(false);
	const [barcode, setBarcode] = useState<string>();
	const [barcodeProducts, setBarcodeProducts] = useState<Product[]>([]);

	const { addToCart } = useCartStore();

	const { data: products } = useSWR(
		"app/product",
		() =>
			fetcher<Product[]>({
				url: `/shop/hs/app/product`,
				method: "GET",
			}),
		{ revalidateOnFocus: false },
	);

	useEffect(() => {
		BarcodeDialog.register(setOpen, setBarcode);
	}, []);

	useEffect(() => {
		if (!barcode) {
			return;
		}
		async function findProductByBarcode() {
			//@ts-expect-error its fine :)
			const links = await getBarcodeProductLinks(barcode).then((l) => l.value);
			setBarcodeProducts([]);
			links.forEach((link) => {
				const product = products?.find((p) => p.ref === link.Номенклатура_Key);
				if (!product) {
					console.error("wtf");
					return;
				}
				setBarcodeProducts((b) => [...b, product]);
			});
		}

		findProductByBarcode();
	}, [barcode]);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25 z-10" />
			<Dialog.Content className="fixed z-20 w-3/6 h-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-20 pb-4 px-4 rounded-lg flex flex-col">
				<Dialog.Close asChild>
					<button className="absolute right-5 top-5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="36"
							height="36"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
						</svg>
					</button>
				</Dialog.Close>
				<Dialog.Title className="text-3xl pb-8 font-medium sr-only">
					Знайдено за штрихкодом
				</Dialog.Title>
				{!barcodeProducts.length ? (
					<div className="h-full flex items-center justify-center text-xl">Не знайдено товар за штрихкодом</div>
				) : null}
				{barcodeProducts.map((product) => (
					<div
						key={product.ref}
						className="border rounded-xl flex items-center gap-2 p-2"
					>
						<div className="flex flex-col text-gray-600">
							<span>{product.searchCode}</span>
							<span>{product.code}</span>
							<span>{product.vendorCode}</span>
						</div>
						<b className="grow">{product.name}</b>
						<span>{product.price.toFixed()}₴</span>
						<span>
							{product.quantity}
							{product.units}
						</span>
						<button
							className="border py-1 px-2 rounded-lg bg-sky-400"
							onClick={() => {
							//TODO Так не можна робити
								addToCart({ ...product, id: "", foundBy: "", quantity: 1 });
								setOpen(false);
							}}
						>
							Додати у кошик
						</button>
					</div>
				))}
			</Dialog.Content>
		</Dialog.Root>
	);
}
