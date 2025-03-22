import { FormEvent, useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useAppStore } from "../stores/useAppStore";
import { useLocation, useSearchParams } from "wouter";
import { useSWRConfig } from "swr";

type SupplierProduct = {
	supId: string;
	article: string;
	name: string;
	description: "";
	price: string;
	photo: string;
	avaible: boolean;
	brand: string;
	currency_name: string;
	stocks: Record<string, { quantity: string | number; price: number }>;
	quantityKhm: string | number;
};

export default function SuppliersSearch() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
	const [items, seItems] = useState<SupplierProduct[]>([]);
	const { mutate } = useSWRConfig();

	const _ = useProducts({});

	async function search(e: FormEvent) {
		e.preventDefault();
		const pb_hook_url = localStorage.getItem("pb_hook_url");
		const cdn_url = localStorage.getItem("cdn_url");
		if (!cdn_url) {
			alert("no 'cdn_url' in localStorage");
			return;
		}
		if (!pb_hook_url) {
			alert("no 'pb_hook_url' in localStorage");
			return;
		}
		mutate("/products/");

		const result = (await fetch(
			`${pb_hook_url}${searchValue.replace(/\s+/g, "")}`,
		)
			.then((res) => res.json())
			.catch((err) => {
				console.error(err);
				return null;
			})) as SupplierProduct[];
		if (result) {
			seItems(result);
		}
	}

	return (
		<main className="py-4 flex flex-col items-center w-full">
			<div className="fixed top-0 bg-white w-full flex justify-center">
				<form
					className="border-2 mt-8 w-2/6 px-2 rounded-xl flex items-center"
					onSubmit={search}
				>
					<input
						className="w-full h-12 text-xl rounded-xl outline-none"
						placeholder="пошук..."
						onChange={(e) => setSearchValue(e.target.value)}
						value={searchValue}
					/>
					<button className="h-10 w-10 text-gray-600 flex items-center justify-center hover:bg-black hover:bg-opacity-20 rounded-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
						</svg>
					</button>
				</form>
			</div>

			<div className="mt-24 w-full px-3">
				{items.map((item) => (
					<Item {...item} key={item.article} />
				))}
			</div>
		</main>
	);
}

function Item({ article, name, brand, stocks, photo }: SupplierProduct) {
	const { data: localProducts } = useProducts({
		onlyInStock: true,
	});
	const localProduct = localProducts?.find(
		(el) =>
			el.code.toLowerCase().trim() === article.toLowerCase() ||
			el.code.replace(/-/g, "").toLowerCase().trim() === article.toLowerCase(),
	);
	const [_, navigate] = useLocation();
	return (
		<div className="border-2 px-4 py-2 rounded-xl mt-1 flex w-full">
			<img
				src={`${localStorage.getItem("cdn_url")}${photo?.replace(/\\/g, "/")}`}
				width={112}
				height={112}
				className="mr-2 my-1 rounded-lg object-cover h-24"
			/>
			<div className="w-3/6">
				{article} <b>{brand}</b>
				<br />
				{name?.replace(article, "")?.replace(brand, "")}
				<br />
				{/*{item.description}*/}
			</div>
			<div className="flex">
				<SupplierButton
					name="Магазин"
					price={localProduct?.price}
					quantity={localProduct?.quantity}
					onClick={() => {
						// TODO: make it look ok
						if (localProduct) {
							useAppStore.setState({
								searchValue: localProduct.searchCode,
							});
							navigate("/document/УТ-00000002/sell");
						}
					}}
				/>
				{Object.entries(stocks).map(([k, v]) => (
					<SupplierButton
						name={k}
						price={(
							v.price * Number(localStorage.getItem("markup") || 1)
						).toFixed()}
						quantity={v.quantity}
					/>
				))}
			</div>
		</div>
	);
}

type SupplierButtonProps = {
	name?: string;
	price?: number | string;
	quantity?: number | string;
	onClick?: () => void;
};

function SupplierButton({
	name,
	price,
	quantity,
	onClick,
}: SupplierButtonProps) {
	return (
		<button
			onClick={onClick}
			className="min-h-12 w-32 border-2 flex flex-col justify-center p-2 rounded-lg mx-1"
		>
			<span>{name}</span>
			<span>Ціна: {price || 0}₴</span>
			{Number(quantity) ? (
				<span className="bg-green-300">Доступно {quantity}</span>
			) : (
				<span className="bg-red-200">Немає</span>
			)}
		</button>
	);
}
