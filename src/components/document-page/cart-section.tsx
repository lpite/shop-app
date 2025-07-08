import { useState } from "react";
import { useAppStore } from "../..//stores/useAppStore";
import * as Dialog from "@radix-ui/react-dialog";

export default function CartSection() {
	const cartProducts = useAppStore((state) => state.cartProducts);
	const removeFromCart = useAppStore((state) => state.removeFromCart);
	const editCart = useAppStore((state) => state.editCart);

	const cartTotalCount = cartProducts.reduce(
		(prev, el) => prev + el.quantity,
		0,
	);
	const cartTotalPrice = cartProducts.reduce(
		(prev, el) => prev + el.price * el.quantity,
		0,
	);

	const cartHeight = useAppStore((state) => state.cartHeight);
	const startResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
		useAppStore.setState((state) => {
			console.log("start");
			return {
				isResizing: true,
				startY: e.clientY,
				startCartHeight: state.cartHeight,
			};
		});
	const [isOpen, setIsOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<string | undefined>();

	function onContextMenu(e: any, s: string) {
		e.preventDefault();
		setSelectedProduct(s);
		setIsOpen(true);
	}

	function onRemoveClick() {
		if (selectedProduct) {
			removeFromCart(selectedProduct);
			setIsOpen(false);
		}
	}

	return (
		<div
			className="bg-sky-100 px-2 rounded-t-xl flex flex-col fixed bottom-0 start-0 end-0"
			style={{ height: cartHeight }}
		>
			<div
				className="cursor-row-resize h-2 border-t-4 border-slate-500 w-full"
				onMouseDown={startResize}
			>
				<div className="h-1.5 bg-slate-300"></div>
			</div>

			<div className="text-xl select-none py-2 pb-1">
				Підібрано {cartTotalCount.toFixed(2)} на суму{" "}
				<b>{cartTotalPrice.toFixed(2)}</b> грн
			</div>
			<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
					<Dialog.Content className="fixed shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2">
						<Dialog.Title className="sr-only">видалити</Dialog.Title>
						<button
							onClick={onRemoveClick}
							className="px-5 py-3 bg-red-500 rounded-lg font-medium text-white"
						>
							Видалити
						</button>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
			<div className="flex w-full select-none">
				<div className="w-12 border border-slate-500 p-1 shrink-0 box-border">
					Код
				</div>
				<div className="w-52 border border-slate-500 p-1 shrink-0 box-border">
					Артикул
				</div>
				<div className="flex-1 border border-slate-500 p-1 box-border">
					Назва
				</div>
				<div className="w-48 border border-slate-500 p-1 shrink-0 box-border">
					Виробник
				</div>
				<div className="w-16 flex items-center border border-slate-500 p-1 shrink-0 box-border">
					Кі-сть
				</div>
				<div className="w-14 border border-slate-500 p-1 shrink-0 box-border">
					Ціна
				</div>
				<div className="w-20 border border-slate-500 p-1 shrink-0 box-border">
					Сума
				</div>
				<div className="w-48 border border-slate-500 p-1 shrink-0 box-border">
					Місце
				</div>
				<div className="w-48 border border-slate-500 p-1 shrink-0 box-border">
					Місце
				</div>
			</div>
			<div className="overflow-y-auto flex-1 pb-2">
				{cartProducts.map((el) => {
					return (
						<div
							key={el.searchCode + "cart"}
							className="flex cursor-default bg-slate-300"
							onContextMenu={(e) => onContextMenu(e, el.searchCode)}
						>
							<div className="w-12 border border-slate-500 p-1 shrink-0 box-border">
								{el.searchCode}
							</div>
							<div className="w-52 border border-slate-500 p-1 shrink-0 box-border">
								{el.code} {el.vendorCode}
							</div>
							<div className="flex-1 border border-slate-500 p-1 box-border">
								{el.name}
							</div>
							<div className="w-48 border border-slate-500 p-1 box-border">
								{el.brand}
							</div>
							<div className="w-16 flex items-center border border-slate-500 p-1 shrink-0 box-border">
								<input
									type="number"
									value={el.quantity}
									className="w-9 h-8 appearance-none text-center outline-none bg-gray-200 rounded-l-lg"
									onChange={(e) =>
										editCart(el.searchCode, parseFloat(e.target.value))
									}
								/>
								<div>
									<button
										className="w-5 bg-gray-200 rounded-tr-lg shrink-0 flex items-center justify-center hover:bg-gray-400"
										onClick={() => editCart(el.searchCode, el.quantity + 1)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											viewBox="0 0 16 16"
										>
											<path
												fillRule="evenodd"
												d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
											/>
										</svg>
									</button>
									<button
										className="w-5 bg-gray-200 rounded-br-lg shrink-0 flex items-center justify-center hover:bg-gray-400"
										onClick={() => editCart(el.searchCode, el.quantity - 1)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											viewBox="0 0 16 16"
										>
											<path
												fillRule="evenodd"
												d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
											/>
										</svg>
									</button>
								</div>
							</div>
							<div className="w-14 border border-slate-500 p-1 shrink-0 box-border">
								{el.price}₴
							</div>
							<div className="w-20 font-bold border border-slate-500 p-1 shrink-0 box-border">
								{(el.price * el.quantity).toFixed(2)}
							</div>
							<div className="w-48 border border-slate-500 p-1 shrink-0 box-border">
								{el.place1 || el.place2 || el.place3}
							</div>
							<div className="w-48 border border-slate-500 p-1 shrink-0 box-border">
								{el.place1 ? el.place2 || el.place3 : null}
							</div>
							{/*<div className="w-48 border border-slate-500 p-1 shrink-0 box-border">
								{el.place1 && el.place2 ? el.place3 : null}
							</div>*/}
						</div>
					);
				})}
			</div>
		</div>
	);
}
