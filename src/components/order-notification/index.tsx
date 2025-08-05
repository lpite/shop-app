import { Check, TriangleAlert, X } from "lucide-react";
import { useSettings } from "../../stores/settingsStore";
import { useOrderNotification } from "./store";
import useSWR from "swr";
import { useEffect, useState } from "react";

export function OrderNotifier() {
	const { order_notification_url } = useSettings();
	const { orderCount } = useOrderNotification();
	const [newOrder, setNewOrder] = useState(false);

	const { data, error } = useSWR(
		(order_notification_url && "order-count") || null,
		() =>
			fetch(order_notification_url)
				.then((r) => r.json())
				.then((json) => json.items[0].value)
				.then((newCount) => {
					if (newCount !== orderCount) {
						setNewOrder(true);
					}
					return newCount;
				}),
		{
			refreshInterval: 3000,
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
	useEffect(() => {
		if (!order_notification_url) {
			useSettings.setState({ order_notification_url: prompt() || "" });
		}
	}, []);

	if (!newOrder && !error) {
		return null;
	}

	return (
		<div
			className={`fixed z-30 end-4 top-48 h-16 ${error && "bg-red-300"} ${newOrder && "bg-white"}  rounded-lg p-2 flex items-center justify-center gap-3 animate-bounce hover:pause border shadow-lg`}
		>
			{error && (
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
