import { StorageCell } from "../api/odata";

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
		storageCells?.find((storageCell) => storageCell.Ref_Key === ref)?.Code ||
		"not found"
	);
}
