import { FormEvent, useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import { FTSProduct } from "../types/product";
import { useSearch, useSearchStore } from "../hooks/useSearch";
import { Base64 } from "js-base64";
import { AgentsAndPartnersGet, fetcher } from "../utils/fetcher";
import useSWR from "swr";
import { Link, useParams } from "wouter";
import {
	Box,
	ChartLine,
	LayoutGrid,
	MessageSquareMore,
	ShoppingCart,
	Users,
	History,
	Play,
	House,
	Boxes,
	Cat,
	Plus,
    Minus,
    Trash2,
} from "lucide-react";

interface Product {
	id: string;
	name: string;
	price: number;
	category: string;
	sku: string;
	brand: string;
	stock: number;
	minStock: number;
	storageLocation: string;
	description: string;
	image: string;
}

export default function AutomotivePOS() {
	const cartProducts = useAppStore((state) => state.cartProducts);
	const addToCart = useAppStore((state) => state.addToCart);
	const removeFromCart = useAppStore((state) => state.removeFromCart);
	const updateQuantity = useAppStore((state) => state.editCart);
	const clearCart = useAppStore((state) => state.clearCart);

	const { data: products, search, clearData } = useSearch({});
	const query = useSearchStore((s) => s.query);
	const setQuery = (query: string) => useSearchStore.setState({ query: query });

	const [selectedProduct, setSelectedProduct] = useState<FTSProduct | null>(
		null,
	);
	const [showProductModal, setShowProductModal] = useState(false);

	const total = cartProducts.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	const handleCheckout = () => {
		if (cartProducts.length === 0) {
			alert("Please add items to cart");
			return;
		}

		alert(`Order processed!\nTotal: $${total.toFixed(2)}`);
		clearCart();
	};

	const getStockBadgeColor = (product: Product) => {
		if (product.stock <= 0) return "bg-red-100 text-red-800";
		if (product.stock <= product.minStock)
			return "bg-yellow-100 text-yellow-800";
		return "bg-green-100 text-green-800";
	};

	const openProductModal = (product: FTSProduct) => {
		setSelectedProduct(product);
		setShowProductModal(true);
	};

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		search();
	}

	const { partnerId } = useParams();

	const { data: agentAndPartner } = useSWR("/clients/", () =>
		fetcher<AgentsAndPartnersGet["response"]>({
			url: "/shop/hs/app/agent-and-partner/",
			method: "GET",
		}),
	);

	const { data: clientSum } = useSWR(`/document-sum/${partnerId}`, () =>
		fetcher<string>({
			url: `/shop/hs/app/sell-document/${partnerId}`,
			method: "GET",
		}),
	);

	async function saveCart() {
		if (!confirm("Дійсно перенести?")) {
			return;
		}

		if (!agentAndPartner) {
			alert("йой");
		}
		const agentName = agentAndPartner?.find(
			(el) => el.partnerId === partnerId,
		)?.agentName;

		if (!agentName) {
			alert("йой");
		}

		const res = await fetcher<string>({
			url: `/shop/hs/app/sale-document`,
			method: "POST",
			body: {
				partnerId,
				agentName: agentName,
				products: cartProducts.map((p) => ({
					...p,
					searchCode: "0".repeat(4 - p.searchCode.length) + p.searchCode,
				})),
			},
		});
		if (res === "Успешно") {
			clearCart();
			useAppStore.setState({ searchValue: "" });
			setQuery("");
			clearData();
		} else {
			alert(res);
		}
	}

	return (
		<div className="h-screen bg-gray-50 p-2">
			<div className="mx-auto h-full flex pl-14">
				<div className="fixed z-50 top-2 start-2 bottom-2 flex p-1 flex-col gap-2 items-center justify-between border rounded-lg bg-white">
					<div className="flex flex-col gap-1">
						<Link to="/vin-demo" className="p-2 hover:bg-slate-100 rounded-md">
							<span>VIN</span>
						</Link>
						<Link
							to="/"
							className="p-2 hover:bg-slate-100 rounded-md flex items-center justify-center"
							title="Історія продажу"
						>
							<History />
						</Link>
						<Link
							to="/"
							className="p-2 hover:bg-slate-100 rounded-md flex items-center justify-center"
							title="Каталог"
						>
							<LayoutGrid />
						</Link>
						<Link
							to="/suppliers-search"
							className="p-2 hover:bg-slate-100 rounded-md flex items-center justify-center"
							title="Постачальники"
						>
							<Boxes />
						</Link>
					</div>
					<div className="flex flex-col gap-1">
						<Link
							to="/"
							className="p-2 hover:bg-slate-100 rounded-md flex items-center justify-center"
						>
							<House />
						</Link>
						<Link
							to="/clients"
							className="p-2 hover:bg-slate-100 rounded-md flex items-center justify-center"
						>
							<Users />
						</Link>
						<Link
							to="/stats"
							className="p-2 hover:bg-slate-100 rounded-md flex items-center justify-center"
						>
							<ChartLine />
						</Link>
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full w-full">
					<div className="lg:col-span-2">
						<div className="bg-white rounded-lg shadow-sm border flex flex-col h-[calc(100vh-1rem)]">
							<div className="p-3 border-b flex items-center justify-between">
								<h2 className="text-lg font-semibold flex items-center gap-2">
									<Box className="h-4" />
									Товари & послуги
								</h2>
								<div className="flex items-center gap-3">
									<span>
										{
											agentAndPartner?.find((el) => el.partnerId === partnerId)
												?.agentName
										}
									</span>
									<span className="font-medium">{clientSum}₴</span>
									<MessageSquareMore className="h-5" />
								</div>
							</div>

							<div className="p-3 border-b bg-white sticky top-0 z-10">
								<form className="relative" onSubmit={onSubmit}>
									<svg
										className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
									<input
										type="text"
										placeholder="Шукай по імені, артикулу, або коду..."
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</form>
							</div>

							<div className="flex-1 overflow-y-auto p-3">
								<div className="space-y-2">
									{products.map((product) => (
										<div
											key={product.id}
											className="flex items-start gap-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
										>
											<div className="w-20 h-20">
												<img
													src={
														"http://" +
														localStorage.getItem("ip") +
														"/api/get-photo.php?photo=" +
														encodeURIComponent(Base64.encode(product.photoPath))
													}
													className="w-full object-cover rounded-md border"
												/>
											</div>

											<div className="flex-1">
												<div className="flex items-start justify-between">
													<div>
														<h3 className="font-medium text-sm text-gray-900">
															{product.name}
														</h3>
														<p className="text-sm text-gray-600">
															<b>{product.searchCode}</b> {product.brand}
														</p>
														<p className="text-xs text-gray-500">
															{product.code.length || product.vendorCode.length
																? "SKU: "
																: null}{" "}
															{product.code} {product.vendorCode}
														</p>
														<p className="text-xs text-gray-500">
															{product.place1.length ||
															product.place2.length ||
															product.place3.length
																? "Місце: "
																: null}{" "}
															{product.place1} {product.place2} {product.place3}
														</p>
													</div>
													<div className="text-right flex flex-col">
														<span
															className={`text-base font-semibold ${product.quantity ? "text-green-600" : "text-red-600"} `}
														>
															{product.price.toFixed(2)}
														</span>
														<span>
															{product.quantity} {product.units}
														</span>
													</div>
												</div>
												<div className="flex items-center justify-end mt-1">
													<div className="flex items-center gap-1">
														<button
															onClick={() => openProductModal(product)}
															className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
														>
															<svg
																className="h-3.5 w-3.5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
																/>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
																/>
															</svg>
														</button>
														<button
															onClick={() =>
																addToCart({ ...product, quantity: 1 })
															}
															disabled={product.quantity <= 0}
															className="p-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
														>
															<Plus className="h-4 w-4" />
														</button>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border top-2 h-[calc(100vh-1rem)] flex flex-col">
						<div className="p-3 border-b">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<ShoppingCart className="h-4" />
								Кошик ({cartProducts.length})
							</h3>
						</div>
						<div className="p-3 flex-1 flex flex-col min-h-0">
							{cartProducts.length === 0 ? (
								<p className="text-gray-500 py-6 text-sm flex justify-center gap-3 items-center w-full">
									<span>Кошик пустий</span> <Cat />
								</p>
							) : (
								<div className="space-y-2 overflow-y-auto flex-1">
									{cartProducts.map((item) => (
										<div
											key={item.id}
											className="relative flex items-center gap-2 p-2 border border-gray-200 rounded-lg"
										>
											<span className="absolute end-2 top-1 text-base">
												{item.searchCode}
											</span>
											<img
												src={
													"http://" +
													localStorage.getItem("ip") +
													"/api/get-photo.php?photo=" +
													encodeURIComponent(Base64.encode(item.photoPath))
												}
												className="w-10 h-10 object-cover rounded border"
											/>
											<div className="flex-1">
												<h4 className="font-medium text-xs">{item.name}</h4>
												<p className="text-xs text-gray-600">
													{item.brand} - {item.code} - {item.vendorCode}
												</p>
												<p className="text-xs text-gray-500">
													📍 {item.place1} {item.place2} {item.place3}
												</p>
												<p className="text-xs text-gray-600">
													{item.price.toFixed(2)} x {item.quantity} ={" "}
													<span className="font-semibold text-gray-800">
														{(item.price * item.quantity).toFixed(2)}
													</span>
												</p>
											</div>
											<div className="flex items-center gap-1">
												<button
													onClick={() =>
														updateQuantity(item.searchCode, item.quantity - 1)
													}
													className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
												>
													<Minus className="w-4 h-4" />
												</button>
												<input
													className="w-6 text-center text-xs"
													value={item.quantity}
													type="number"
													onChange={(e) =>
														updateQuantity(
															item.searchCode,
															parseFloat(e.target.value),
														)
													}
												/>
												<button
													onClick={() =>
														updateQuantity(item.searchCode, item.quantity + 1)
													}
													className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
												>
													<Plus className="w-4 h-4" />
												</button>
												<button
													onClick={() => removeFromCart(item.searchCode)}
													className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</div>
									))}
								</div>
							)}

							{cartProducts.length > 0 && (
								<>
									<div className="space-y-3 text-sm pt-2">
										<div className="flex justify-between font-bold">
											<span>Разом:</span>
											<span>{total.toFixed(2)}</span>
										</div>
									</div>
									<button
										onClick={saveCart}
										className="w-full mt-3 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
									>
										Перенести
									</button>
								</>
							)}
						</div>
					</div>
				</div>

				{showProductModal && selectedProduct && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
							<div className="p-4">
								<div className="flex justify-between items-start mb-3">
									<div>
										<h3 className="text-lg font-semibold">
											{selectedProduct.name}
										</h3>
										<p className="text-gray-600 text-sm">
											{selectedProduct.brand}
										</p>
									</div>
									<button
										onClick={() => setShowProductModal(false)}
										className="text-gray-400 hover:text-gray-600"
									>
										<svg
											className="h-5 w-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<img
									src={
										"http://" +
										localStorage.getItem("ip") +
										"/api/get-photo.php?photo=" +
										encodeURIComponent(Base64.encode(selectedProduct.photoPath))
									}
									alt={selectedProduct.name}
									className="w-full h-84 object-contain rounded-md border mb-3"
								/>

								<div className="grid grid-cols-2 gap-3 text-xs mb-3">
									<div>
										<strong>SKU:</strong> {selectedProduct.code}{" "}
										{selectedProduct.vendorCode}
									</div>
									<div>
										<strong>Price:</strong> {selectedProduct.price.toFixed(2)}
									</div>
									<div>
										<strong>Stock:</strong> {selectedProduct.quantity}
									</div>
									<div className="col-span-2">
										<strong>Location:</strong> {selectedProduct.place1}{" "}
										{selectedProduct.place2} {selectedProduct.place3}
									</div>
								</div>

								<p className="text-xs text-gray-600 mb-3">
									{selectedProduct.description}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
