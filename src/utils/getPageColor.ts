/**
 * @description Повертає колір сторінки POS в залежності від клієнта та типу
 */

export function getPageColor(partnerId?: string, type?: string) {
	
	if(type === "return"){
		return "bg-red-200"
	}

	if (partnerId !== "УТ-00000002" && type === "sell") {
		return "bg-green-100";
	}

	return null;
}
