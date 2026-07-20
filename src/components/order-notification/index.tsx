import { Check, TriangleAlert, X } from "lucide-react";
import { useConfig } from "../../stores/config-store";
import { useOrderNotification } from "./store";
import useSWR from "swr";
import { useState } from "react";

export function OrderNotifier() {
	const { pb_base_url } = useConfig();
	const { orderCount } = useOrderNotification();
	const [newOrder, setNewOrder] = useState(false);

	const isDev = import.meta.env.MODE === "development";

	const { data, error } = useSWR(
		pb_base_url ? pb_base_url : null,
		() =>
			fetch(`${pb_base_url}/api/collections/kv/records`)
				.then((r) => r.json())
				.then((json) => json.items[0].value)
				.then((newCount) => {
					if (newCount !== orderCount) {
						setNewOrder(true);
					}
					return newCount;
				}),
		{
			refreshInterval: 20000,
		},
	);

	function dismissNotification() {
		setNewOrder(false);
	}

	function acceptNotification() {
		if (!confirm("Точно?")) {
			return;
		}
		setNewOrder(false);
		useOrderNotification.setState({ orderCount: data });
	}

	if (!newOrder && !error) {
		return null;
	}

	return (
		<div
			className={`fixed z-30 end-4 top-48 h-16 ${error && "bg-red-300"} ${newOrder && "bg-white"}  rounded-lg p-2 flex items-center justify-center gap-3 animate-bounce hover:pause border shadow-lg`}
		>
			{error && !isDev && (
				<>
					<TriangleAlert className="text-red-600" />
					<span className="text-lg font-medium">
						Помилка сповіщення замовлення
					</span>
				</>
			)}
			{newOrder && (
				<>
					<TriangleAlert className="text-yellow-600" />
					<span className="text-lg font-medium">Нове замовлення</span>
					<button
						onClick={acceptNotification}
						className="p-2 hover:bg-slate-200 rounded-lg"
					>
						<Check />
					</button>
					<button
						onClick={dismissNotification}
						className="p-2 hover:bg-slate-200 rounded-lg"
					>
						<X />
					</button>
				</>
			)}
		</div>
	);
}
