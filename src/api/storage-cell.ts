import useSWR, { SWRConfiguration } from "swr";
import { fetcher } from "../utils/fetcher";

export type StorageCell = {
	ref: string;
	id: string;
	isFolder: boolean;
	parentRef: string;
	parentId: string;
	DeletionMark: boolean;
};

async function getStorageCells(): Promise<StorageCell[] | undefined> {
	return fetcher({
		url: "/shop/hs/api/storage-cells",
		method: "GET",
	});
}

export function useStorageCells(
	config?: SWRConfiguration<StorageCell[] | undefined>,
) {
	return useSWR("odata/catalog/storage-cells", getStorageCells, config);
}

export const StorageCell = {};
