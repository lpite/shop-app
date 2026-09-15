import { StorageCell } from "../api/storage-cell";

const EMPTY_REF = "00000000-0000-0000-0000-000000000000";

export function getStorageCellCode(storageCells?: StorageCell[], ref?: string) {
	if (!storageCells) {
		return "";
	}

	if (!ref) {
		return "";
	}

	if (ref === EMPTY_REF) {
		return "";
	}
	return (
		storageCells?.find((storageCell) => storageCell.ref === ref)?.id ||
		"not found"
	);
}
