import { FormEvent, useState } from "react";
import useSWR from "swr";
import { useParams } from "wouter";
import {
	EllipsisVertical,
	Image as ImageIcon,
	Minus,
	PackageSearch,
	Plus,
	Search,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Base64 } from "js-base64";

import Show from "../utils/Show";
import { getPageColor } from "../utils/getPageColor";

import { useSearch } from "../hooks/useSearch";
import { useCartStore } from "../stores/cart-store";
import { useConfig } from "../stores/config-store";

import { Pos } from "../api/pos";
import { client } from "../api/client";
import { Product } from "../api/product";

import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import { BarcodeDialog } from "../components/document-page/barcode-dialog/barcode-dialog-state";
import { BarcodeDialogPortal } from "../components/document-page/barcode-dialog/barcode-dialog-portal";
import { ProductDetailsDialog } from "../components/document-page/product-details-dialog/product-details-dialog-state";
import { ProductDetailsDialogPortal } from "../components/document-page/product-details-dialog/product-details-dialog-portal";

import { FTSProduct } from "../types/product";

function ProductPhoto({ productId }: { productId: string }) {
	const serverUrl = useConfig((s) => s.server_url);
	const { data: photos } = useSWR(
		productId ? ["product-photos", productId] : null,
		() => Product.getPhotos(productId),
	);

	const photo = photos?.[0];

	if (!photo) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
				<ImageIcon className="size-8" />
			</div>
		);
	}

	return (
		<img
			className="w-full h-full object-cover"
			src={`${serverUrl}/api/get-photo.php?photo=${encodeURIComponent(Base64.encode(photo))}`}
		/>
	);
}

function ProductCard({ product }: { product: FTSProduct }) {
	const addToCart = useCartStore((state) => state.addToCart);

	return (
		<div className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm">
			<div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border">
				<ProductPhoto productId={product.id} />
			</div>
			<div className="flex-1 min-w-0 flex flex-col">
				<div className="flex items-start justify-between gap-2">
					<span className="font-medium line-clamp-1">{product.name}</span>
					<button
						onClick={() => ProductDetailsDialog.openPopup(product)}
						className="shrink-0 text-gray-500"
					>
						<EllipsisVertical />
					</button>
				</div>
				<span className="text-xs text-gray-500">
					{product.article}
					<Show when={product.oem.length && product.article.length}> </Show>
					{product.oem}
				</span>
				<div className="mt-auto flex items-center justify-between gap-3 pt-2">
					<span className="text-lg font-bold">
						{product.price?.toFixed(2)}₴
						<Show when={!product.quantity}>
							<span className="text-red-700 font-bold"> · Немає</span>
						</Show>
						<Show when={product.quantity}>
							<span className="text-lg font-medium text-gray-600">
								{" "}
								· {product.quantity} {product.units}
							</span>
						</Show>
					</span>
					<button
						onClick={() => addToCart({ ...product, quantity: 1 })}
						className="bg-sky-600 text-white rounded-xl p-3 active:bg-sky-500"
					>
						<Plus className="size-7" />
					</button>
				</div>
				<div className="flex flex-wrap gap-1 pt-1">
					{product.places?.filter(Boolean).map((place, i) => (
						<span
							key={i}
							className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-600"
						>
							{place}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}

export default function MobilePos() {
	const { partnerId, type } = useParams();
	const {
		query,
		setQuery,
		search,
		data: products,
		isLoading: isLoadingProducts,
		isValidating: isValidatingProducts,
		history,
		clearData,
		error,
	} = useSearch({ fts: true });
	const { cartProducts, editCart, removeFromCart, clearCart } = useCartStore();
	const { use_pos_v2_api } = useConfig();
	const [tab, setTab] = useState<"search" | "cart">("search");

	const { data: agentAndPartner } = useSWR(partnerId ? "clients/" : null, () =>
		client.getOne(partnerId || ""),
	);

	useBarcodeScanner({
		onScanEnd: (barcode) => {
			BarcodeDialog.openPopup(barcode);
		},
	});

	const cartTotalCount = cartProducts.reduce(
		(prev, el) => prev + el.quantity,
		0,
	);
	const cartTotalPrice = Math.ceil(
		cartProducts.reduce((prev, el) => prev + el.price * el.quantity, 0),
	);

	function onSearchSubmit(e: FormEvent) {
		e.preventDefault();
		search();
	}

	async function saveCart() {
		if (!cartProducts.length) {
			return;
		}

		if (!confirm("Дійсно перенести?")) {
			return;
		}

		const agentName = agentAndPartner?.agentName;
		if (!agentName) {
			console.error("no agentName");
			return;
		}

		if (!partnerId) {
			console.error("no partnerId");
			return;
		}

		const sellFunction = use_pos_v2_api
			? Pos.sellProductsV2
			: Pos.sellProductsV1;

		const saveFunction = type === "sell" ? sellFunction : Pos.returnProducts;
		if (await saveFunction({ agentName, partnerId, products: cartProducts })) {
			clearCart();
			setQuery("");
			clearData();
			toast.success("Успішно! Збережено.");
		} else {
			alert("Не вдалося перенести!");
		}
	}

	return (
		<div
			className={`h-full overflow-hidden flex flex-col ${getPageColor(partnerId, type) || ""}`}
		>
			<ProductDetailsDialogPortal />
			<BarcodeDialogPortal />
			{isLoadingProducts ? (
				<div className="fixed z-10 start-0 top-0 end-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
					<div className="w-24 h-24 border-8 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
				</div>
			) : null}

			<header
				className={`flex items-center gap-2 px-4 py-3 ${getPageColor(partnerId, type) || "bg-slate-100"}`}
			>
				<span className="text-lg font-semibold">POS</span>
				<div className="flex-1" />
				<span>{type === "sell" ? "Продаж" : "Повернення"}</span>
			</header>

			<main className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
				{tab === "search" ? (
					<div className="flex flex-col gap-3">
						<form onSubmit={onSearchSubmit} className="flex gap-2 pt-3">
							<input
								className="border-2 flex-1 h-12 rounded-xl px-3 text-base"
								value={query}
								onChange={({ target }) => setQuery(target.value)}
								placeholder="Пошук товару..."
							/>
							<button
								disabled={isValidatingProducts || !query}
								className="h-12 px-4 rounded-xl bg-sky-600 text-white active:bg-sky-500 disabled:bg-slate-400"
							>
								<Search />
							</button>
						</form>
						<Show when={history.length}>
							<div className="flex gap-2 overflow-x-auto">
								{history.slice(0, 5).map((item, i) => (
									<button
										key={i + item}
										className="shrink-0 px-3 py-1 bg-white rounded-full text-sm shadow-sm active:bg-slate-200"
										onClick={() => {
											setQuery(item);
											search();
										}}
									>
										{item}
									</button>
								))}
							</div>
						</Show>
						{!isLoadingProducts && !products.length && !cartProducts.length ? (
							<div className="text-center text-gray-500 py-16">
								Нічого не знайдено
							</div>
						) : null}
						{error ? (
							<div className="text-center text-gray-500 py-16">Помилка</div>
						) : null}
						{products
							?.slice(0, 100)
							.map((product, i) => <ProductCard key={i} product={product} />)}
						{products.length > 100 ? (
							<div className="text-center text-gray-500 py-8">
								Запит дуже неточний
							</div>
						) : null}
					</div>
				) : (
					<div className="flex flex-col h-full">
						<div className="sticky top-0 z-10 pt-3 pb-2 flex items-center gap-2">
							<span className="bg-white rounded-xl px-3 py-2 shadow-sm text-sm">
								Підібрано <b>{cartTotalCount.toFixed(2)}</b> на суму{" "}
								<b>{cartTotalPrice}</b> грн
							</span>
							<div className="flex-1" />
							<Show when={cartProducts.length}>
								<button
									onClick={() => {
										if (confirm("Точно?")) {
											clearCart();
										}
									}}
									className="bg-white rounded-xl p-2 shadow-sm text-red-600"
								>
									<Trash2 />
								</button>
							</Show>
						</div>
						{!cartProducts.length ? (
							<div className="text-center text-gray-500 py-16">
								Кошик порожній
							</div>
						) : (
							cartProducts.map((product) => (
								<div
									key={product.id + "cart"}
									className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm"
								>
									<div className="flex-1 min-w-0">
										<span className="font-medium block line-clamp-1">
											{product.name}
										</span>
										<span className="text-xs text-gray-500">
											{product.article}
											<Show when={product.oem.length && product.article.length}>
												{" "}
											</Show>
											{product.oem}
										</span>
										<div className="flex items-center justify-between pt-1">
											<span className="text-sm">
												{product.price?.toFixed(2)}₴ × {product.quantity} ={" "}
												<b>
													{Math.ceil(product.price * product.quantity).toFixed(
														2,
													)}
												</b>
											</span>
											<button
												onClick={() => removeFromCart(product.id)}
												className="text-red-500 p-1"
											>
												<Trash2 className="size-5" />
											</button>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => editCart(product.id, product.quantity - 1)}
											className="bg-gray-100 rounded-lg p-2 active:bg-gray-300"
										>
											<Minus />
										</button>
										<span className="w-8 text-center font-medium">
											{product.quantity}
										</span>
										<button
											onClick={() => editCart(product.id, product.quantity + 1)}
											className="bg-gray-100 rounded-lg p-2 active:bg-gray-300"
										>
											<Plus />
										</button>
									</div>
								</div>
							))
						)}
						<button
							onClick={saveCart}
							disabled={!cartProducts.length}
							className="mt-3 bg-green-500 disabled:bg-slate-200 text-slate-900 font-medium text-lg py-3 rounded-xl active:bg-green-400"
						>
							{type === "sell" ? "Перенести в документ" : "Повернути"}
						</button>
					</div>
				)}
			</main>

			<nav className="flex border-t bg-white pb-[env(safe-area-inset-bottom)]">
				<button
					onClick={() => setTab("search")}
					className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${tab === "search" ? "text-sky-600" : "text-gray-500"}`}
				>
					<PackageSearch />
					<span className="text-xs">Пошук</span>
				</button>
				<button
					onClick={() => setTab("cart")}
					className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative ${tab === "cart" ? "text-sky-600" : "text-gray-500"}`}
				>
					<ShoppingCart />
					<span className="text-xs">Кошик</span>
					<Show when={cartProducts.length}>
						<span className="absolute top-1 start-1/2 translate-x-3 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
							{Math.ceil(cartTotalCount)}
						</span>
					</Show>
				</button>
			</nav>
		</div>
	);
}
