import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { State } from "./state";
import { Product } from "../../../types/product";

export default function ProductDetailsPopup() {
	const [open, setOpen] = useState(false);
	const [product, setProduct] = useState<Product | undefined>();

	useEffect(() => {
		State.register(setOpen, setProduct);
	}, []);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
			<Dialog.Content className="fixed w-3/6 h-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
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
				<Dialog.Title className="text-3xl pb-8 font-medium">
					Докладніше про товар
				</Dialog.Title>
				<div className="h-full shrink overflow-y-auto">
					<span className="font-medium">Опис / Додаткова інформація - </span>
					<span> {product?.description}</span>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	);
}
