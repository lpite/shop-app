import { create } from "zustand";
import { persist } from "zustand/middleware";
import z from "zod";

export const configSchema = z.object({
	pb_base_url: z.url(),
	meow: z.array(z.object({ id: z.string(), color: z.string() })),
	server_url: z.url(),
	use_app_return_page: z.boolean(),
});

export type Config = z.infer<typeof configSchema>;
export type ConfigKeys = keyof Config;

export const useConfig = create<Config>()(
	persist<Config>(
		() => ({
			pb_base_url: "",
			meow: [],
			server_url: "",
			use_app_return_page: false,
		}),
		{
			name: "settings",
		},
	),
);
