import { ChangeEvent, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import useSWR from "swr";
import { X } from "lucide-react";

import {
	getCustomer,
	getOrderStatuses,
	getSuplierOrders,
	getSuppliers,
	createOrder,
	SupplierOrderWithProductsAndCustomer,
	updateOrder,
	Supplier,
} from "../api/supplier_orders";

function formatPhoneNumber(phoneNumber: string) {
	return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
}

export function OrderDialog() {
	const {
		data: orders,
		mutate: mutateOrders,
		isLoading: isLoadingOrders,
		isValidating: isValidatingOrders,
	} = useSWR("customer_orders", () => getSuplierOrders());
	const { data: suppliers } = useSWR("suppliers", () => getSuppliers());
	const { data: orderStatuses } = useSWR("order_statuses", () =>
		getOrderStatuses(),
	);

	const [isOpen, setIsOpen] = useState(false);
	const [view, setView] = useState("list");
	const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
	const [editingOrderStatus, setEditingOrderStatus] = useState<string | null>(
		null,
	);

	function resetForm() {
		setEditingOrderId(null);
	}

	const openCreateForm = () => {
		resetForm();
		setView("form");
	};

	function openEditForm(order: SupplierOrderWithProductsAndCustomer) {
		setEditingOrderId(order.id);
		setEditingOrderStatus(order.status);
	}

	const closeDialog = () => {
		setIsOpen(false);
	};

	function getStatusColor(currentStatus: string | null | undefined) {
		switch (currentStatus) {
			case "awaiting_items":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "awaiting_customer":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "finished":
				return "bg-green-100 text-green-800 border-green-200";
			case "canceled":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	}

	function onOpenChange() {
		if (isOpen) {
			closeDialog();
			setEditingOrderId(null);
			setEditingOrderStatus(null);
		} else {
			mutateOrders();
			setIsOpen(true);
		}
	}

	return (
		<Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
			<Dialog.Trigger asChild>
				<button className="bg-fuchsia-200 hover:bg-fuchsia-300 text-gray-800 px-3 h-10 rounded-lg shadow-md font-semibold">
					Замовлення
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60" />
				<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl focus:outline-none overflow-hidden">
					<div className="flex justify-between items-center p-6 border-b bg-gray-50">
						<Dialog.Title className="text-xl font-bold">
							{view === "list" ? "Замовлення клієнтів" : "Створення замовлення"}
						</Dialog.Title>
						<Dialog.Close asChild>
							<button className="text-gray-400 hover:text-gray-600 focus:outline-none text-xl">
								<X className="size-8" />
							</button>
						</Dialog.Close>
					</div>
					<div className="flex-1 overflow-y-auto p-6">
						{view === "list" && (
							<div>
								<div className="flex justify-between items-center mb-6">
									<div className="flex gap-2">
										{orderStatuses
											?.filter((status) => !status.label.includes("Скасовано"))
											.map((status) => (
												<div
													key={status.id}
													className={`px-3 py-2 rounded-xl flex gap-1 border-2 ${getStatusColor(status.name)}`}
												>
													<span>{status.label}:</span>
													<span>
														{
															orders?.filter(
																(order) => order.status === status.id,
															).length
														}
													</span>
												</div>
											))}
									</div>
									<button
										onClick={openCreateForm}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
									>
										+ Створити замовлення
									</button>
								</div>

								<div className="space-y-4 h-full">
									{orders?.length === 0 ? (
										<div className="text-center border-2 border-dashed rounded-lg bg-gray-50 h-full">
											<p className="text-gray-500">Ще немає замовлень</p>
										</div>
									) : null}

									{isLoadingOrders || isValidatingOrders ? (
										<div className="text-center border-2 border-dashed rounded-lg bg-gray-50 h-full">
											<p className="text-gray-500">Завантаження</p>
										</div>
									) : null}

									{!isLoadingOrders &&
										!isValidatingOrders &&
										orders?.map((order) => {
											const total = order?.products.reduce(
												(sum, p) => sum + p.price * p.quantity,
												0,
											);
											const balance = total - order.deposit;
											const editing = order.id === editingOrderId;
											const orderStatus = orderStatuses?.find(
												(s) => s.id === order.status,
											);

											return (
												<div
													key={order.id}
													className="border rounded-lg p-4 bg-white relative"
												>
													{editing ? (
														<div className="absolute top-0 left-0 w-full h-full bg-white rounded-lg p-4">
															<button
																className="absolute right-4 top-4 bg-fuchsia-100 px-2 py-1 rounded-lg"
																onClick={async () => {
																	if (editingOrderId && editingOrderStatus) {
																		const result = await updateOrder({
																			id: editingOrderId,
																			status: editingOrderStatus,
																		});
																		if (result) {
																			setEditingOrderId(null);
																			mutateOrders();
																		}
																	}
																}}
															>
																Зберегти
															</button>
															Зміна статусу
															<div className="flex gap-3 pt-3">
																{orderStatuses?.map((status) => (
																	<button
																		key={`status_button_${status.id}`}
																		className={`${status.id === editingOrderStatus ? "scale-105 font-bold" : ""} border px-3 py-2 disabled:shadow-lg rounded-lg ${getStatusColor(status.name)}`}
																		disabled={status.id === editingOrderStatus}
																		onClick={() =>
																			setEditingOrderStatus(status.id)
																		}
																	>
																		{status.label}
																	</button>
																))}
															</div>
														</div>
													) : null}
													<div className="flex justify-between border-b pb-3 mb-3">
														<div>
															<div className="flex items-center gap-3 mb-1">
																<h3 className="font-semibold text-lg">
																	{formatPhoneNumber(
																		order.customer.phone_number,
																	)}
																</h3>
																<span
																	className={`text-sm px-2.5 py-1 rounded-full border capitalize ${getStatusColor(
																		orderStatus?.name,
																	)}`}
																>
																	{orderStatus?.label || "Помилка"}
																</span>
																<span>
																	id:{" "}
																	<span className="font-semibold text-lg">
																		{order.id}
																	</span>
																</span>
															</div>
															{(order.car_name || order.car_vin) && (
																<div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm border border-slate-200">
																	{order.car_name && (
																		<span className="font-medium">
																			{order.car_name}
																		</span>
																	)}
																	{order.car_vin && (
																		<span className="text-xs text-slate-500 font-mono tracking-wider ml-1">
																			VIN: {order.car_vin}
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
																Редагувати
															</button>
															<div className="text-sm">
																<span className="text-gray-500 mr-2">
																	Всього:
																</span>
																<span className="font-medium">
																	{total?.toFixed(2)}₴
																</span>
															</div>
															<div className="text-sm">
																<span className="text-gray-500 mr-2">
																	Застава:
																</span>
																<span className="font-medium text-orange-600">
																	{order.deposit?.toFixed(2)}₴
																</span>
															</div>
															<div className="text-sm font-bold mt-1 pt-1 border-t">
																<span className="text-gray-700 mr-2">
																	До сплати:
																</span>
																<span
																	className={
																		balance > 0
																			? "text-red-600"
																			: "text-green-600"
																	}
																>
																	{balance?.toFixed(2)}₴
																</span>
															</div>
														</div>
													</div>
													<ul className="text-sm text-gray-700 space-y-2">
														{order?.products.map((p, idx) => (
															<li
																key={idx}
																className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded border border-gray-100"
															>
																<div className="flex gap-4">
																	<span className="text-gray-800 text-sm mt-0.5 block w-48">
																		Артикул: {p.article}
																	</span>
																	<span>{p.name}</span>
																	<span className="text-gray-600 text-xs mt-0.5 ml-2">
																		{suppliers?.find(
																			(supplier) =>
																				supplier.id === p.supplier_id,
																		)?.name || "Без постачальника"}
																	</span>
																</div>
																<div className="flex gap-2">
																	<span className="font-medium">
																		Кількість: {p.quantity}
																	</span>
																	<span className="font-medium">
																		Ціна: {p.price}₴
																	</span>
																	<span className="font-medium">
																		Разом: {(p.price * p.quantity).toFixed(2)}₴
																	</span>
																</div>
															</li>
														))}
													</ul>
												</div>
											);
										})}
								</div>
							</div>
						)}
						{view === "form" && (
							<OrderCreationForm
								mutateOrders={mutateOrders}
								setView={setView}
								suppliers={suppliers}
							/>
						)}
					</div>
					<div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
						{view === "form" ? (
							<>
								<button
									type="button"
									onClick={() => {
										setView("list");
									}}
									className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md font-medium transition-colors"
								>
									Скасувати
								</button>
								<button
									type="submit"
									form="order-form"
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									Створити
								</button>
							</>
						) : (
							<Dialog.Close asChild>
								<button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors">
									Закрити
								</button>
							</Dialog.Close>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

type OrderCreationFormProps = {
	mutateOrders: () => void;
	setView: (view: string) => void;
	suppliers?: Supplier[];
};

function OrderCreationForm({
	mutateOrders,
	setView,
	suppliers,
}: OrderCreationFormProps) {
	const [customer, setCustomer] = useState({
		phoneNumber: "",
		name: "",
		restricted: false,
		notes: "",
	});

	const [order, setOrder] = useState({
		deposit: 0,
		carVin: "",
		carName: "",
		notes: "",
		status: "",
	});

	const [products, setProducts] = useState<
		{
			article: string;
			name: string;
			supplier_id: string;
			price: number;
			quantity: number;
		}[]
	>([{ article: "", name: "", supplier_id: "", price: 0, quantity: 1 }]);

	async function onPhoneNumberChange(e: ChangeEvent<HTMLInputElement>) {
		setCustomer((c) => ({
			...c,
			phoneNumber: e.target.value,
			restricted: false,
		}));

		if (e.target.value.length === 10) {
			const customer = await getCustomer(e.target.value);
			if (customer) {
				setCustomer({ ...customer, phoneNumber: e.target.value });
			}
		}
	}

	const handleAddProduct = () => {
		setProducts([
			...products,
			{ article: "", name: "", supplier_id: "", price: 0, quantity: 1 },
		]);
	};

	const handleRemoveProduct = (index: number) => {
		setProducts(products.filter((_, i) => i !== index));
	};

	const handleProductChange = (index: number, field: string, value: string) => {
		const updated = [...products];
		if (field === "price" || field === "quantity") {
			updated[index][field] = parseInt(value);
		} else {
			//@ts-expect-error meow.
			updated[index][field] = value;
		}

		setProducts(updated);
	};

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (customer.restricted) return;

		createOrder(
			{ ...order, car_name: order.carName, car_vin: order.carVin },
			{ ...customer, phone_number: customer.phoneNumber },
			products as any,
		);

		mutateOrders();
		// resetForm();
		setView("list");
	};

	return (
		<form id="order-form" onSubmit={handleSubmit} className="space-y-8">
			<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
				<h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
					1. Інформація про клієнта
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Номер телефону
						</label>
						<div className="flex gap-2">
							<input
								required
								type="tel"
								value={customer.phoneNumber}
								onChange={onPhoneNumberChange}
								className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
								placeholder=""
								maxLength={10}
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Імʼя
						</label>
						<input
							type="text"
							value={customer.name}
							onChange={(e) =>
								setCustomer((c) => ({ ...c, name: e.target.value }))
							}
							className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="Пес патрон"
						/>
					</div>
					<div className="col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Замітки про клієнта
						</label>
						<input
							type="text"
							value={customer.notes}
							onChange={(e) =>
								setCustomer((c) => ({ ...c, notes: e.target.value }))
							}
							className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>
				{customer.restricted === true && (
					<div className="mt-3 p-3 bg-red-100 text-red-800 text-sm font-medium rounded-md border border-red-200 flex items-center">
						⚠️ Цей користувач: цей користувач обмежений у створенні замовлень
						без застави
					</div>
				)}
			</div>
			<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
				<h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
					2. Дані про машину
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Автомобіль
						</label>
						<input
							type="text"
							value={order.carName}
							onChange={(e) =>
								setOrder((o) => ({ ...o, carName: e.target.value }))
							}
							className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder=""
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							VIN
						</label>
						<input
							type="text"
							value={order.carVin}
							onChange={(e) =>
								setOrder((o) => ({ ...o, carVin: e.target.value }))
							}
							className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
							placeholder="1HGCM..."
							maxLength={17}
						/>
					</div>
				</div>
			</div>
			<div>
				<div className="flex justify-between items-center mb-3 border-b pb-2">
					<h3 className="font-semibold text-gray-800">3. Товари</h3>
					<button
						type="button"
						onClick={handleAddProduct}
						className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded font-medium transition-colors"
					>
						+ Додати
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
										Артикул
									</label>
									<input
										required
										type="text"
										value={product.article}
										onChange={(e) =>
											handleProductChange(index, "article", e.target.value)
										}
										className="w-full border rounded px-2 py-1.5 text-sm"
										placeholder="....."
									/>
								</div>
								<div className="col-span-3">
									<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
										Імʼя
									</label>
									<input
										required
										type="text"
										value={product.name}
										onChange={(e) =>
											handleProductChange(index, "name", e.target.value)
										}
										className="w-full border rounded px-2 py-1.5 text-sm"
										placeholder="Фільтр..."
									/>
								</div>
								<div className="col-span-3">
									<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
										Постачальник
									</label>
									<select
										required
										value={product.supplier_id}
										onChange={(e) =>
											handleProductChange(index, "supplier_id", e.target.value)
										}
										className="w-full border rounded px-2 py-1.5 text-sm bg-white"
									>
										<option>-</option>
										{suppliers?.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
								</div>
								<div className="col-span-2">
									<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
										Ціна
									</label>
									<input
										required
										type="number"
										step="0.01"
										value={product.price}
										onChange={(e) =>
											handleProductChange(index, "price", e.target.value)
										}
										className="w-full border rounded px-2 py-1.5 text-sm"
									/>
								</div>
								<div className="col-span-2">
									<label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase">
										Кількість
									</label>
									<input
										required
										type="number"
										min="1"
										value={product.quantity}
										onChange={(e) =>
											handleProductChange(index, "quantity", e.target.value)
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
			<div className="grid grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Застава
					</label>
					<div className="relative">
						<span className="absolute left-3 top-2 text-gray-500">₴</span>
						<input
							type="number"
							value={order.deposit}
							onChange={(e) =>
								setOrder((o) => ({
									...o,
									deposit: parseInt(e.target.value),
								}))
							}
							className="w-full border rounded-md pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>
				<div className="flex justify-end items-end gap-2">
					<span className="text-xl">Сума:</span>
					<span className="text-xl font-bold">
						{products
							.reduce((acc, el) => acc + el.price * el.quantity, 0)
							.toFixed(2) || "0.00"}
					</span>
				</div>
			</div>
		</form>
	);
}
