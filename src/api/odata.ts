import { fetcher } from "../utils/fetcher";

export async function getBarcodeProductLinks(barcode: string) {
	return fetcher<{
		value: {
			Штрихкод: string;
			Номенклатура_Key: string;
			Характеристика_Key: string;
			Упаковка_Key: string;
		}[];
	}>({
		url: `/shop/odata/standard.odata/InformationRegister_ШтрихкодыНоменклатуры?$format=json&$filter=Штрихкод eq '${barcode}'`,
		method: "GET",
	}).then((r) => r.value);
}

export async function getProduct() {}

export const odata = {};
