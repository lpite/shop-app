import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Settings {
	pb_base_url: string;
}

export const useSettings = create<Settings>()(
	persist(
		() => ({
			pb_base_url: "",
		}),
		{
			name: "settings",
		},
	),
);
