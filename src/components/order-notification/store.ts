import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrderNotificationStore {
	orderCount: number;
}

export const useOrderNotification = create<OrderNotificationStore>()(
	persist(
		() => ({
			orderCount: 0,
		}),
		{
			name: "order-notification",
		},
	),
);
