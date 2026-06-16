import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

// --- MOCK API ---
const checkCustomerByPhone = async (phone) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (phone.replace(/\D/g, "") === "5551112222") {
				resolve({ found: true, name: "John Doe (Banned)", isBanned: true });
			} else if (phone.replace(/\D/g, "") === "5559998888") {
				resolve({ found: true, name: "Alice Smith", isBanned: false });
			} else {
				resolve({ found: false, name: "", isBanned: false });
			}
		}, 600);
	});
};

const SUPPLIERS = [
	"Select Supplier",
	"TechSource Inc.",
	"Global Parts Co.",
	"Local Warehouse",
	"Direct Drop",
];
const STATUSES = [
	"awaiting products",
	"awaiting customer",
	"canceled",
	"finished",
];

export function OrderDialog() {
	const [orders, setOrders] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [view, setView] = useState("list");
	const [editingOrderId, setEditingOrderId] = useState(null);

	// --- Form State ---
	const [phoneNumber, setPhoneNumber] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [isBanned, setIsBanned] = useState(false);
	const [isLookingUp, setIsLookingUp] = useState(false);

	// New Vehicle State
	const [carName, setCarName] = useState("");
	const [carVin, setCarVin] = useState("");

	const [status, setStatus] = useState("awaiting products");
	const [mortgage, setMortgage] = useState(0);

	const [products, setProducts] = useState([
		{ article: "", name: "", supplier: "", price: 0, count: 1 },
	]);

	// --- Helpers ---
	const resetForm = () => {
		setPhoneNumber("");
		setCustomerName("");
		setIsBanned(false);
		setCarName("");
		setCarVin("");
		setStatus("awaiting products");
		setMortgage(0);
		setProducts([{ article: "", name: "", supplier: "", price: 0, count: 1 }]);
		setEditingOrderId(null);
	};

	const openCreateForm = () => {
		resetForm();
		setView("form");
	};

	const openEditForm = (order) => {
		setPhoneNumber(order.phoneNumber);
		setCustomerName(order.customerName);
		setIsBanned(order.isBanned || false);
		setCarName(order.carName || "");
		setCarVin(order.carVin || "");
		setStatus(order.status);
		setMortgage(order.mortgage);
		setProducts(JSON.parse(JSON.stringify(order.products)));
		setEditingOrderId(order.id);
		setView("form");
	};

	const closeDialog = () => {
		setIsOpen(false);
		setView("list");
		resetForm();
	};

	// --- Customer Lookup ---
	const handleLookupCustomer = async () => {
		if (!phoneNumber) return;
		setIsLookingUp(true);
		try {
			const data = await checkCustomerByPhone(phoneNumber);
			if (data.found) {
				setCustomerName(data.name);
				setIsBanned(data.isBanned);
			} else {
				setCustomerName("");
				setIsBanned(false);
				alert("Customer not found. You can enter their name manually.");
			}
		} catch (error) {
			console.error("API Error", error);
		} finally {
			setIsLookingUp(false);
		}
	};

	// --- Product Handlers ---
	const handleAddProduct = () => {
		setProducts([
			...products,
			{ article: "", name: "", supplier: "", price: 0, count: 1 },
		]);
	};

	const handleRemoveProduct = (index) => {
		setProducts(products.filter((_, i) => i !== index));
	};

	const handleProductChange = (index, field, value) => {
		const updated = [...products];
		updated[index][field] =
			field === "price" || field === "count" ? Number(value) : value;
		setProducts(updated);
	};

	// --- Submit Handler ---
	const handleSubmit = (e) => {
		e.preventDefault();
		if (isBanned) return;

		const orderData = {
			customerName,
			phoneNumber,
			isBanned,
			carName,
			carVin: carVin.toUpperCase(),
			status,
			mortgage: Number(mortgage),
			products,
		};

		if (editingOrderId) {
			setOrders(
				orders.map((o) =>
					o.id === editingOrderId ? { ...o, ...orderData } : o,
				),
			);
		} else {
			setOrders([...orders, { id: Date.now(), ...orderData }]);
		}

		resetForm();
		setView("list");
	};

	// --- Status Badge Color Helper ---
	const getStatusColor = (currentStatus) => {
		switch (currentStatus) {
			case "awaiting products":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "awaiting customer":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "finished":
				return "bg-green-100 text-green-800 border-green-200";
			case "canceled":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (

		<Dialog.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) closeDialog();
				else setIsOpen(true);
			}}
		>
			<Dialog.Trigger asChild>
				<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md font-semibold transition-all">
					Open Order Manager
				</button>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

				<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl focus:outline-none overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<div className="flex justify-between items-center p-6 border-b bg-gray-50">
						<Dialog.Title className="text-xl font-bold">
							{view === "list"
								? "Замовлення клієнтів"
								: editingOrderId
									? `Edit Order #${editingOrderId.toString().slice(-6)}`
									: "Створення замовлення"}
						</Dialog.Title>
						<Dialog.Close asChild>
							<button className="text-gray-400 hover:text-gray-600 focus:outline-none text-xl">
								✕
							</button>
						</Dialog.Close>
					</div>

					{/* Scrollable Body */}
					<div className="flex-1 overflow-y-auto p-6">
						{/* --- VIEW: LIST --- */}
						{view === "list" && (
							<div>
								<div className="flex justify-end items-center mb-6">
									<button
										onClick={openCreateForm}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
									>
										+ Create Order
									</button>
								</div>

								<div className="space-y-4">
									{orders.length === 0 ? (
										<div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
											<p className="text-gray-500">No orders exist yet.</p>
										</div>
									) : (
										orders.map((order) => {
											const total = order.products.reduce(
												(sum, p) => sum + p.price * p.count,
												0,
											);
											const balance = total - order.mortgage;

											return (
												<div
													key={order.id}
													className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
												>
													<div className="flex justify-between border-b pb-3 mb-3">
														<div>
															<div className="flex items-center gap-3 mb-1">
																<h3 className="font-semibold text-lg">
																	{order.customerName}
																</h3>
																<span
																	className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getStatusColor(order.status)}`}
																>
																	{order.status}
																</span>
															</div>
															<p className="text-sm text-gray-500 mb-2">
																📞 {order.phoneNumber}
															</p>

															{/* Vehicle Display */}
															{(order.carName || order.carVin) && (
																<div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm border border-slate-200">
																	<span>🚗</span>
																	{order.carName && (
																		<span className="font-medium">
																			{order.carName}
																		</span>
																	)}
																	{order.carVin && (
																		<span className="text-xs text-slate-500 font-mono tracking-wider ml-1">
																			VIN: {order.carVin}
																		</span>
																	)}
																</div>
															)}
														</div>
														<div className="text-right flex flex-col items-end gap-1">
															<button
																onClick={() => openEditForm(order)}
																className="text-sm text-blue-600 hover:text-blue-800 font-medium underline mb-1"
															>
																Edit Order
															</button>
															<div className="text-sm">
																<span className="text-gray-500 mr-2">
																	Total:
																</span>
																<span className="font-medium">
																	${total.toFixed(2)}
																</span>
															</div>
															<div className="text-sm">
																<span className="text-gray-500 mr-2">
																	Mortgage:
																</span>
																<span className="font-medium text-orange-600">
																	${order.mortgage.toFixed(2)}
																</span>
															</div>
															<div className="text-sm font-bold mt-1 pt-1 border-t">
																<span className="text-gray-700 mr-2">
																	Due:
																</span>
																<span
																	className={
																		balance > 0
																			? "text-red-600"
																			: "text-green-600"
																	}
																>
																	${balance.toFixed(2)}
																</span>
															</div>
														</div>
													</div>
													<ul className="text-sm text-gray-700 space-y-2">
														{order.products.map((p, idx) => (
															<li
																key={idx}
																className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded border border-gray-100"
															>
																<div className="flex gap-4">
																	<span>
																		<span className="font-medium text-blue-600">
																			{p.count}x
																		</span>{" "}
																		{p.name}
																	</span>
																	<span className="text-gray-400 text-xs mt-0.5">
																		Art: {p.article}
																	</span>
																	<span className="text-gray-400 text-xs mt-0.5 ml-2">
																		🏭 {p.supplier || "No supplier"}
																	</span>
																</div>
																<span className="font-medium">
																	${(p.price * p.count).toFixed(2)}
																</span>
															</li>
														))}
													</ul>
												</div>
											);
										})
									)}
								</div>
							</div>
						)}

						{/* --- VIEW: FORM (CREATE / EDIT) --- */}
						{view === "form" && (
							<form
								id="order-form"
								onSubmit={handleSubmit}
								className="space-y-8"
							>
								{/* --- Customer Section --- */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
										1. Customer Identification
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Phone Number (API Key)
											</label>
											<div className="flex gap-2">
												<input
													required
													type="tel"
													value={phoneNumber}
													onChange={(e) => {
														setPhoneNumber(e.target.value);
														setIsBanned(false);
													}}
													className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
													placeholder="5551112222"
												/>
												<button
													type="button"
													onClick={handleLookupCustomer}
													disabled={isLookingUp || !phoneNumber}
													className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
												>
													{isLookingUp ? "..." : "Lookup"}
												</button>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Customer Name
											</label>
											<input
												required
												type="text"
												value={customerName}
												onChange={(e) => setCustomerName(e.target.value)}
												className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
												placeholder="John Doe"
											/>
										</div>
									</div>
									{isBanned && (
										<div className="mt-3 p-3 bg-red-100 text-red-800 text-sm font-medium rounded-md border border-red-200 flex items-center">
											⚠️ WARNING: This customer is banned from placing orders.
											You cannot save this order.
										</div>
									)}
								</div>

								{/* --- Vehicle Details Section --- */}
								<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
									<h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
										2. Vehicle Details
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Car Make & Model
											</label>
											<input
												type="text"
												value={carName}
												onChange={(e) => setCarName(e.target.value)}
												className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
												placeholder="e.g., Toyota Camry 2018"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												VIN (Vehicle Identification Number)
											</label>
											<input
												type="text"
												value={carVin}
												onChange={(e) => setCarVin(e.target.value)}
												className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
												placeholder="1HGCM..."
												maxLength={17}
											/>
										</div>
									</div>
								</div>

								{/* --- Order Details Section --- */}
								<div className="grid grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Order Status
										</label>
										<select
											value={status}
											onChange={(e) => setStatus(e.target.value)}
											className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
										>
											{STATUSES.map((s) => (
												<option key={s} value={s}>
													{s}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Mortgage (Deposit Paid)
										</label>
										<div className="relative">
											<span className="absolute left-3 top-2 text-gray-500">
												$
											</span>
											<input
												type="number"
												min="0"
												step="0.01"
												value={mortgage}
												onChange={(e) => setMortgage(e.target.value)}
												className="w-full border rounded-md pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
											/>
										</div>
									</div>
								</div>

								{/* --- Products Section --- */}
								<div>
									<div className="flex justify-between items-center mb-3 border-b pb-2">
										<h3 className="font-semibold text-gray-800">
											3. Products & Suppliers
										</h3>
										<button
											type="button"
											onClick={handleAddProduct}
											className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded font-medium transition-colors"
										>
											+ Add Item
										</button>
									</div>

									<div className="space-y-3">
										{products.map((product, index) => (
											<div
												key={index}
												className="flex gap-2 items-start bg-white p-3 rounded-lg border shadow-sm"
											>
												<div className="grid grid-cols-12 gap-2 flex-1">
													<div className="col-span-2">
														<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
															Article
														</label>
														<input
															required
															type="text"
															value={product.article}
															onChange={(e) =>
																handleProductChange(
																	index,
																	"article",
																	e.target.value,
																)
															}
															className="w-full border rounded px-2 py-1.5 text-sm"
															placeholder="SKU-12"
														/>
													</div>
													<div className="col-span-3">
														<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
															Name
														</label>
														<input
															required
															type="text"
															value={product.name}
															onChange={(e) =>
																handleProductChange(
																	index,
																	"name",
																	e.target.value,
																)
															}
															className="w-full border rounded px-2 py-1.5 text-sm"
															placeholder="Product"
														/>
													</div>
													<div className="col-span-3">
														<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
															Supplier
														</label>
														<select
															required
															value={product.supplier}
															onChange={(e) =>
																handleProductChange(
																	index,
																	"supplier",
																	e.target.value,
																)
															}
															className="w-full border rounded px-2 py-1.5 text-sm bg-white"
														>
															{SUPPLIERS.map((s) => (
																<option
																	key={s}
																	value={s === "Select Supplier" ? "" : s}
																	disabled={s === "Select Supplier"}
																>
																	{s}
																</option>
															))}
														</select>
													</div>
													<div className="col-span-2">
														<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
															Price ($)
														</label>
														<input
															required
															type="number"
															min="0"
															step="0.01"
															value={product.price}
															onChange={(e) =>
																handleProductChange(
																	index,
																	"price",
																	e.target.value,
																)
															}
															className="w-full border rounded px-2 py-1.5 text-sm"
														/>
													</div>
													<div className="col-span-2">
														<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
															Qty
														</label>
														<input
															required
															type="number"
															min="1"
															value={product.count}
															onChange={(e) =>
																handleProductChange(
																	index,
																	"count",
																	e.target.value,
																)
															}
															className="w-full border rounded px-2 py-1.5 text-sm"
														/>
													</div>
												</div>
												{products.length > 1 && (
													<button
														type="button"
														onClick={() => handleRemoveProduct(index)}
														className="mt-5 text-gray-400 hover:text-red-600 p-1.5 rounded transition-colors"
														title="Remove item"
													>
														✕
													</button>
												)}
											</div>
										))}
									</div>
								</div>
							</form>
						)}
					</div>

					{/* Footer / Actions */}
					<div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
						{view === "form" ? (
							<>
								<button
									type="button"
									onClick={() => {
										setView("list");
										resetForm();
									}}
									className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md font-medium transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									form="order-form"
									disabled={isBanned}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									{editingOrderId ? "Update Order" : "Save Order"}
								</button>
							</>
						) : (
							<Dialog.Close asChild>
								<button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors">
									Close Manager
								</button>
							</Dialog.Close>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
