import { create } from "zustand";
import { persist } from "zustand/middleware";
import z from "zod";

export const configSchema = z.object({
	pb_base_url: z.url(),
	order_notification_url: z.url(),
	use_fancy_pos: z.boolean(),
	test: z.number(),
	meow: z.array(z.object({ id: z.string(), color: z.string() })),
});

export type Config = z.infer<typeof configSchema>;
export type ConfigKeys = keyof Config;

export const useConfig = create<Config>()(
	persist<Config>(
		() => ({
			pb_base_url: "",
			order_notification_url: "",
			test: 0,
			meow: [],
			use_fancy_pos: false,
		}),
		{
			name: "settings",
		},
	),
);
