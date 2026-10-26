import { fetcher } from "../utils/fetcher";

type StoragePlace = {
	id: number;
	name: string;
	isFolder: boolean;
	deletionMark: boolean;
	parentId: number | null;
};

function getList() {
	return fetcher<StoragePlace[]>({
		url: "/shop/hs/api/storage-places",
		method: "GET",
	});
}

export const StoragePlace = { getList };
