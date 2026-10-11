import useSWR, { SWRConfiguration } from "swr";
import { fetcher } from "../utils/fetcher";
import { getOdataValue } from "../utils/odata";

export type StorageCell = {
	Ref_Key: string;
	Description: string;
	Code: string;
	IsFolder: boolean;
	Parent_Key: string;
	DeletionMark: boolean;
};

async function getStorageCells() {
	return fetcher<any>({
		url: "/shop/odata/standard.odata/Catalog_СкладскиеЯчейки?$format=json&$select=Ref_Key,Parent_Key,Description,Code,IsFolder,DeletionMark",
		method: "GET",
	}).then((r) => getOdataValue<StorageCell[]>(r));
}

export function useStorageCells(config?: SWRConfiguration<StorageCell[]>) {
	return useSWR("odata/catalog/storage-cells", odata.getStorageCells, config);
}

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

export const odata = {
	getStorageCells,
};
