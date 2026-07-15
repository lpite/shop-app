import { toast } from "sonner";
import { useConfig } from "../stores/config-store";

type SupplierOrder = {
	id: string;
	date: string;
	deposit: number;
	car_vin: string;
	car_name: string;
	status: string;
};

type SupplierOrderProduct = {
	id: string;
	article: string;
	name: string;
	price: number;
	quantity: number;
	supplier_id: string;
};

export type SupplierOrderWithProductsAndCustomer = SupplierOrder & {
	customer: Customer;
} & {
	products: SupplierOrderProduct[];
};

export async function getSuplierOrders(): Promise<
	SupplierOrderWithProductsAndCustomer[]
> {
	const { pb_base_url } = useConfig.getState();

	return await fetch(
		`${pb_base_url}/api/collections/supplier_order_with_products/records?perPage=10`,
	)
		.then((r) => r.json())
		.then((r) => r.items)
		.catch((err) => {
			console.error(err);
			toast.error("Помилка отримання замовлень");
			return [];
		});
}

export async function createOrder(
	order: Omit<SupplierOrder, "id" | "date">,
	customer: Omit<Customer, "id">,
	products: Omit<SupplierOrderProduct, "id">[],
) {
	const { pb_base_url } = useConfig.getState();
	const isCustomerExists = await getCustomer(customer.phone_number);

	let customerId = isCustomerExists?.id;
	if (!isCustomerExists) {
		await fetch(`${pb_base_url}/api/collections/customers/records`, {
			method: "POST",
			body: JSON.stringify(customer),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((r) => r.json())
			.then((r) => {
				customerId = r.id;
			})
			.catch((err) => {
				console.log(err);
				toast.error("Помилка створення клієнту");
			});
	}

	if (!customerId) {
		throw new Error("Помилка користувача замовлення");
	}

	const orderId = await fetch(
		`${pb_base_url}/api/collections/supplier_orders/records`,
		{
			method: "POST",
			body: JSON.stringify({
				order,
				customer_id: customerId,
				status: "05thvo36e5fdj19",
			}),
			headers: {
				"Content-Type": "application/json",
			},
		},
	)
		.then((r) => r.json())
		.then((r) => r.id)
		.catch((err) => {
			console.error(err);
			toast.error("Помилка створення замовлення");
		});

	if (!orderId) {
		throw new Error("Помилка створення замовлення");
	}

	for (const product of products) {
		await fetch(
			`${pb_base_url}/api/collections/supplier_order_product/records`,
			{
				method: "POST",
				body: JSON.stringify({
					...product,
					order_id: orderId,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}

export async function updateOrder(order: {
	id: string;
	status?: string;
	deposit?: number;
}) {
	const { pb_base_url } = useConfig.getState();

	const response = await fetch(
		`${pb_base_url}/api/collections/supplier_orders/records/${order.id}`,
		{
			method: "PATCH",
			body: JSON.stringify({ status: order.status, deposit: order.deposit }),
			headers: {
				"Content-Type": "application/json",
			},
		},
	)
		.then((r) => r.ok)
		.catch((err) => {
			console.error(err);
			toast.error("Помилка оновлення статусу");
			return false;
		});

	return response;
}

type Customer = {
	id: string;
	phone_number: string;
	restricted: boolean;
	name: string;
	notes: string;
};

export async function getCustomer(
	phoneNumber: string,
): Promise<Customer | undefined | null> {
	const { pb_base_url } = useConfig.getState();

	return await fetch(
		`${pb_base_url}/api/collections/customers/records?filter=phone_number='${phoneNumber}'`,
	)
		.then((r) => r.json())
		.then((r) => r.items[0])
		.catch((err) => {
			console.error(err);
			return null;
		});
}

type Supplier = {
	id: string;
	name: string;
};

export async function getSuppliers(): Promise<Supplier[]> {
	const { pb_base_url } = useConfig.getState();

	return await fetch(`${pb_base_url}/api/collections/suppliers/records`)
		.then((r) => r.json())
		.then((r) => r.items)
		.catch((err) => {
			console.error(err);
			toast.error("Помилка постачальників замовлень");
			return [];
		});
}

type SupplierOrderStatus = {
	id: string;
	name:
		| "awaiting_items"
		| "awaiting_customer"
		| "canceled_error"
		| "canceled_delay"
		| "canceled_refuse"
		| "finished";
	label: string;
};

export async function getOrderStatuses(): Promise<SupplierOrderStatus[]> {
	const { pb_base_url } = useConfig.getState();

	return await fetch(
		`${pb_base_url}/api/collections/supplier_order_status/records`,
	)
		.then((r) => r.json())
		.then((r) => r.items)
		.catch((err) => {
			console.error(err);
			toast.error("Помилка отримання статусів замовлень");
			return [];
		});
}
