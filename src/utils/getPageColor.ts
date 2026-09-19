/**
 * @description Повертає колір сторінки POS в залежності від клієнта та типу
 */

import { useConfig } from "../stores/config-store";

export function getPageColor(partnerId?: string, type?: string) {
	if (type === "return") {
		return "bg-red-200";
	}

	const { main_partner_id } = useConfig.getState();

	if (partnerId !== main_partner_id && type === "sell") {
		return "bg-blue-200";
	}

	return null;
}
