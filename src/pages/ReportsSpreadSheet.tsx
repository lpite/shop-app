import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";
import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { useSearchParams } from "wouter";

export function ReportsSpreadSheet() {
	const {
		data: suppliers,
		isLoading: isLoadingSuppliers,
		isValidating: isValidatingSuppliers,
	} = useSWR("/api/suppliers/", () =>
		fetcher<any[]>({
			url: "/shop/hs/api/suppliers",
			method: "GET",
		}),
	);

	const [searchParams, setSearchParams] = useSearchParams();
	const selectedSupplier = searchParams.get("supplier") || undefined;
	const { data: m, isLoading } = useSWR(
		selectedSupplier
			? "reports/leftovers-by-supplier/" + selectedSupplier
			: null,
		() =>
			fetcher<any[]>({
				url: "/shop/hs/reports/leftovers-by-supplier/" + selectedSupplier,
				method: "GET",
			}),
		{ revalidateOnMount: false },
	);

	const data:Matrix<CellBase<any>> = [
		[{ value: 1,readOnly:true }, { value: 2 },{value:79}],
		[{ value: "=SUM(A1:C1)",}, { value: 3 }],
	];
	return <Spreadsheet data={data} />;
}
