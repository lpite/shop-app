import useSWR from "swr";
import { Dispatch, FormEvent, useEffect, useRef, useState } from "react";
import useSWRMutation from "swr/mutation";

import * as Dialog from "@radix-ui/react-dialog";
import { useDebounce } from "@uidotdev/usehooks";
import { fetcher } from "../utils/fetcher";

export default function PriceChanger() {
	const [selRow, selRowf] = useState<number | undefined>(undefined);

	const [searchValue, setSearchValue] = useState("");
	const debouncedSearchValue = useDebounce(searchValue, 300);

	const [isOpenCMDK, setIsOpenCMDK] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState({
		name: "",
		searchCode: "",
	});

	const {
		data: prices,
		mutate,
		isLoading: isLoadingPrices,
		isValidating: isValidatingPrices,
	} = useSWR(
		selectedProduct.searchCode.length ? `/prices/` : null,
		() =>
			fetcher({
				url: `/shop/hs/api/product-price/00-${"0".repeat(8 - selectedProduct.searchCode.length) + selectedProduct.searchCode}/Розничная`,
				method: "GET",
			}) as Promise<
				{
					registatorId: string;
					registatorType: string;
					registatorDate: string;
					price: number;
					rowNumber: number;
				}[]
			>,
		{
			revalidateOnFocus: false,
			revalidateOnMount: false,
		},
	);

	const { trigger, isMutating } = useSWRMutation(
		"/mutate",
		(
			_,
			{
				arg: { newPrice, index },
			}: { arg: { newPrice: number; index: number } },
		) =>
			fetcher({
				url: `/shop/hs/api/product-price/00-${"0".repeat(8 - selectedProduct.searchCode.length) + selectedProduct.searchCode}/Розничная`,
				method: "PATCH",
				body: {
					newPrice: newPrice,
					registatorDate: prices && prices[index].registatorDate,
					registatorType: prices && prices[index].registatorType,
					registatorId: prices && prices[index].registatorId,
				},
			}),
	);

	const { data: products } = useSWR(
		"/products/",
		() =>
			fetcher({
				url: `/shop/hs/app/product`,
				method: "GET",
			}) as Promise<{ name: string; searchCode: string }[]>,
		{ revalidateOnFocus: false },
	);

	async function save(index: number) {
		if (!prices) {
			alert("Немає цін");
			return;
		}
		if (index === undefined) {
			alert("Не обрана ціна");
			return;
		}
		const newPrice = parseFloat(prompt("Нова ціна?") || "0");
		if (newPrice === 0) {
			return;
		}

		await trigger({ newPrice, index });
		await mutate();
		selRowf(undefined);
	}

	function selectProduct(p: any) {
		setIsOpenCMDK(false);
		setSelectedProduct(p);
		console.log(
			"0".repeat(8 - selectedProduct.searchCode.length) +
				selectedProduct.searchCode,
		);
	}
	useEffect(() => {
		mutate();
	}, [selectedProduct, mutate]);

	return (
		<main className="flex items-center justify-center flex-col h-full">
			<h1 className="text-3xl mb-2 font-medium">мяу мяу</h1>
			<button
				onClick={() => setIsOpenCMDK(true)}
				disabled={isMutating || isLoadingPrices || isValidatingPrices}
				className="border-2 m-2 mt-4 outline-none px-4 py-2 rounded-lg hover:shadow-md focus:shadow-md disabled:bg-gray-400 duration-150"
			>
				Пошук
			</button>
			<div className="h-16 text-2xl flex items-center gap-3">
				<span>{selectedProduct.searchCode}</span>
				<span>{selectedProduct.name}</span>
			</div>
			<CMDK
				search={searchValue}
				onChangeSearch={setSearchValue}
				isOpen={isOpenCMDK}
				onChangeOpen={setIsOpenCMDK}
				closeOnSelect={true}
				items={products
					?.filter((el) =>
						`${el?.name.toLowerCase()} ${el?.searchCode}`.includes(
							debouncedSearchValue.toLowerCase(),
						),
					)
					.slice(0, 100)
					.map((product) => ({
						id: product.searchCode,
						name: product.name,
						onClick: () => setSelectedProduct(product),
					}))}
			/>
			<div className="h-2/6 relative">
				<div
					className={`border-4 border-t-transparent h-12 w-12 rounded-full absolute left-2/4 top-2/4 animate-spin ${isLoadingPrices || isValidatingPrices ? "opacity-100" : "opacity-0"}`}
				></div>
				<table cellSpacing={0} cellPadding={12}>
					<thead>
						<tr>
							<th>№ док</th>
							<th>Дата</th>
							<th>Ціна</th>
						</tr>
					</thead>
					<tbody
						className={`${isLoadingPrices || isValidatingPrices ? "opacity-0" : "opacity-100"} transition-opacity duration-150`}
					>
						{prices &&
							prices?.map((el, i) => (
								<tr
									className={`${selRow === i ? "bg-slate-400" : ""} cursor-pointer h-2`}
									onMouseDown={() => {
										selRowf(i);
										save(i);
									}}
									// onDoubleClick={save}
									key={i}
								>
									<td
										className={`${isLoadingPrices || isValidatingPrices ? "border-transparent" : ""} border-2`}
									>
										{el.registatorId}
									</td>
									<td
										className={`${isLoadingPrices || isValidatingPrices ? "border-transparent" : ""} border-2`}
									>
										{el.registatorDate}
									</td>
									<td
										className={`${isLoadingPrices || isValidatingPrices ? "border-transparent" : ""} border-2`}
									>
										{el.price}

										{/*<input type="number" value={el.price} onChange={(e) => prices[i].price = Number(e.target.value)} />*/}
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
		</main>
	);
}

type CMDKProps = {
	search: string;
	onChangeSearch: Dispatch<React.SetStateAction<string>>;
	isOpen: boolean;
	onChangeOpen: Dispatch<React.SetStateAction<boolean>>;
	items?: { id: string; name: string; onClick?: () => void }[];
	onFormSubmit?: () => void;
	closeOnSelect?: boolean;
};

function CMDK({
	search,
	onChangeSearch,
	items = [],
	isOpen,
	onChangeOpen,
	onFormSubmit,
	closeOnSelect,
}: CMDKProps) {
	const [focusedItem, setFocusedItem] = useState(0);
	// щоб нормально достукуватися в обробнику натискань
	const focusedItemRef = useRef(focusedItem);

	const itemsBlockRef = useRef<HTMLDivElement>(null);

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		if (onFormSubmit) {
			onFormSubmit();
		}
		const focused = items[focusedItem];
		if (focused.onClick) {
			focused.onClick();
			if (closeOnSelect) {
				onChangeOpen(false);
			}
		}
	}

	function arrowListener(event: KeyboardEvent) {
		if (event.key === "ArrowDown") {
			focusedItemRef.current = focusedItemRef.current + 1;
			setFocusedItem((c) => c + 1);
		}
		if (event.key === "ArrowUp") {
			if (focusedItemRef.current !== 0) {
				focusedItemRef.current = focusedItemRef.current - 1;
				setFocusedItem((c) => c - 1);
			}
		}
		if (focusedItemRef.current >= 3 && itemsBlockRef.current) {
			// завжди тримаємо сфокусований по центру
			itemsBlockRef.current.scrollTo({
				top: (focusedItemRef.current - 3) * 44,
				behavior: "smooth",
			});
		}
	}

	useEffect(() => {
		window.addEventListener("keydown", arrowListener);
		return () => window.removeEventListener("keydown", arrowListener);
	}, []);

	return (
		<>
			<Dialog.Root open={isOpen} onOpenChange={onChangeOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
					<Dialog.Content className="fixed w-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg">
						<Dialog.Title className="sr-only">пошук товарів</Dialog.Title>
						<form
							className="border-b-2 relative flex items-center"
							onSubmit={onSubmit}
						>
							<input
								className="w-full outline-none px-3 py-3 font-bold text-2xl duration-150 rounded-xl"
								placeholder="Пошук..."
								onChange={(e) => onChangeSearch(e.target.value)}
								value={search}
							/>
							<button
								type="button"
								className="absolute right-2 p-2 rounded-lg hover:bg-black hover:bg-opacity-10"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
								</svg>
							</button>
						</form>
						<div className="px-3 py-2 h-80 overflow-y-auto" ref={itemsBlockRef}>
							{!items.length ? (
								<div className="h-full flex items-center justify-center text-2xl">
									Почни шукати
								</div>
							) : null}
							{items.map((item, index) => (
								<button
									onClick={() => {
										item.onClick ? item.onClick() : null;
										closeOnSelect ? onChangeOpen(false) : null;
									}}
									key={item.id}
									className={`text-xl text-start w-full px-2 py-2 hover:bg-black hover:bg-opacity-10 rounded ${focusedItem === index ? "bg-black !bg-opacity-20" : ""}`}
								>
									{item.name}
								</button>
							))}
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
