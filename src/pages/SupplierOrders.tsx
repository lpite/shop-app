import useSWR from "swr";
import { useConfig } from "../stores/configStore";
import { Trash2 } from "lucide-react";

interface Order {
	id: string;
	status: string;
	car: string;
	car_vin: string;
	sum: number;
	deposit: number;
	paid: boolean;
	created: string;
	phone_number: string;
	customer_name: string;
	products: {
		id: string;
		article: string;
		name: string;
		price: string;
		quantity: number;
		supplier: string;
	}[];
}

const CLASS_BY_STATUS: Record<string, string> = {
	Виконано: "bg-green-200 text-green-800",
	"Очікує покупця": "bg-pink-200 text-black",
};

export function SupplierOrders() {
	const { pb_base_url } = useConfig();
	const { data } = useSWR(
		"/suplier-orders",
		() =>
			fetch(
				`${pb_base_url}/api/collections/supplier_order_with_products/records`,
			)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<Order[]>,
	);
	return (
		<main className="pt-24 px-2">
			<div className="fixed top-0 bg-white w-full flex justify-center">
				<form className="border-2 mt-8 w-2/6 px-2 rounded-xl flex items-center">
					<input
						className="w-full h-12 text-xl rounded-xl outline-none"
						placeholder="Номер телефону"
					/>
					<span className="text-gray-400 pr-4"></span>
					<button className="h-10 w-10 text-gray-600 flex items-center justify-center hover:bg-black hover:bg-opacity-20 rounded-lg disabled:bg-gray-400">
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
			<div>
				{data?.map((order) => {
					const orderDate = new Date(order.created);
					return (
						<div key={order.id} className="border-2 mt-2 p-3 rounded-xl">
							<div className="flex w-full gap-4">
								<span className="text-lg">
									<span className="text-slate-800 text-base mr-2">Дата:</span>
									<input
										type="date"
										onChange={(e) => console.log(e.target.value)}
										defaultValue={orderDate.toISOString().split("T")[0]}
										disabled={true}
										title={orderDate.toLocaleString()}
									/>
								</span>
								<span className="text-lg">
									<span className="text-slate-800 text-base mr-2">Номер:</span>
									<input
										type="text"
										defaultValue={order.phone_number}
										className="w-36"
									/>
								</span>
								<span className="text-lg">
									<span className="text-slate-800 text-base mr-2">Імʼя:</span>
									<input type="text" defaultValue={order.customer_name} />
								</span>
								<div className="flex-1 flex justify-end">
									<span
										className={`px-2 py-1 text-sm rounded-xl font-semibold ${CLASS_BY_STATUS[order.status]}`}
									>
										{order.status}
									</span>
								</div>
								{/*	<div className="flex flex-col gap-1">
							
								{order.paid && (
									<span className="px-2 py-1 text-sm bg-green-100 text-green-700 font-semibold rounded-xl">
										Оплачено
									</span>
								)}
							</div>*/}
							</div>
							<div className="pt-2">
								<span className="text-slate-700 text-sm">Товари:</span>
								<table className="w-full">
									<thead className="border-b-2">
										<tr>
											<td className="text-sm">#</td>
											<td className="text-sm">Артикул</td>
											<td className="text-sm">Назва</td>
											<td className="text-sm">Ціна</td>
											<td className="text-sm">Кількість</td>
											<td className="text-sm">Постачальник</td>
										</tr>
									</thead>
									<tbody>
										{order.products.map((product, i) => (
											<tr
												key={product.id}
												className="hover:bg-gray-200 duration-75 border-2"
											>
												<td className="px-2">{i + 1}</td>
												<td>{product.article}</td>
												<td>{product.name}</td>
												<td>{product.price}грн</td>
												<td>{product.quantity}</td>
												<td>{product.supplier}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="flex gap-12 mt-4">
								<span className="">
									<span className="text-slate-700 text-sm">Сума: </span>
									<span className="text-xl">{order.sum} грн</span>
								</span>
								<span className="">
									<span className="text-slate-700 text-sm">Застава: </span>
									<span className="text-xl">{order.deposit} грн</span>
								</span>
								<span className="">
									<span className="text-slate-700 text-sm">
										Залишок до сплати:{" "}
									</span>
									<span className="text-xl">
										{order.sum - order.deposit} грн
									</span>
								</span>
								<div className="flex-1 flex justify-end">
									<button className="px-3 py-1.5 bg-red-400 hover:bg-red-500 rounded-lg font-medium text-white flex items-center gap-2 duration-75 hover:shadow-smд">
										<Trash2 className="h-5 w-5" />
										<span>Скасувати</span>
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</main>
	);
}
