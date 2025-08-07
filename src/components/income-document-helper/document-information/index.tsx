import { Building2 } from "lucide-react";
import { IncomeDocument } from "../../../pages/IncomeDocumentHelper";
import useSWR from "swr";
import { fetcher } from "../../../utils/fetcher";

interface DocumentInformationProps {
	document: IncomeDocument;
	setDocument: (d: IncomeDocument) => void;
}

export function DocumentInformation({
	document,
	setDocument,
}: DocumentInformationProps) {
	const { data: suppliers } = useSWR("suppliers", () =>
		fetcher<{ value: any[] }>({
			method: "GET",
			url: "/shop/odata/standard.odata/Catalog_Партнеры?$format=json&$filter=Поставщик eq true",
		}).then((r) => r.value),
	);

	const { data: counterparties } = useSWR("counterparties", () =>
		fetcher<{ value: any[] }>({
			method: "GET",
			url: `/shop/odata/standard.odata/Catalog_Контрагенты?$format=json`,
		}).then((r) => r.value),
	);

	const { data: warehouses } = useSWR("warehouses", () =>
		fetcher<{ value: any[] }>({
			method: "GET",
			url: `/shop/odata/standard.odata/Catalog_Склады?$format=json`,
		}).then((r) => r.value),
	);

	return (
		<div className="bg-white rounded-lg shadow w-full">
			<div className="px-6 py-4 border-b border-gray-200">
				<h3 className="text-lg font-medium text-gray-900 flex items-center">
					<Building2 className="h-5 w-5 mr-2" />
					Основные реквизиты
				</h3>
			</div>
			<div className="p-6 space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Постачальник
							</label>
							<select
								value={document.supplierRef}
								onChange={(e) =>
									setDocument({ ...document, supplierRef: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">-</option>
								{suppliers?.map((supplier) => (
									<option key={supplier.Ref_Key} value={supplier.Ref_Key}>
										{supplier.Description}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Контрагент
							</label>
							<select
								onChange={(e) =>
									setDocument({ ...document, counterPartyRef: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">-</option>
								{counterparties
									?.filter((el) => el.Партнер_Key === document.supplierRef)
									?.map((counterparty) => (
										<option
											key={counterparty.Ref_Key}
											value={counterparty.Ref_Key}
										>
											{counterparty.Description}
										</option>
									))}
							</select>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Склад
							</label>
							<select
								onChange={(e) =>
									setDocument({ ...document, warehouseRef: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">-</option>
								{warehouses?.map((warehouse) => (
									<option key={warehouse.Ref_Key} value={warehouse.Ref_Key}>
										{warehouse.Description}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Комментарий
					</label>
					<textarea
						value={document.comment}
						onChange={(e) =>
							setDocument({ ...document, comment: e.target.value })
						}
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</div>
		</div>
	);
}
