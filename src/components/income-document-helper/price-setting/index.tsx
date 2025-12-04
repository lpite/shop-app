import useSWR from "swr";
import { useIncomeDocumentHepler } from "../../../stores/income-document-helper-store";
import { Product } from "../../../types/product";
import { fetcher } from "../../../utils/fetcher";

export function PriceSetting() {
	const { document, changeProductPrice } = useIncomeDocumentHepler();
	const { data: products } = useSWR("/app/product", () =>
		fetcher<Product[]>({
			url: "/shop/hs/app/product/",
			method: "GET",
		}),
	);

	return (
		<div>
			<div className="px-6 py-4 mb-5 border-b border-gray-200">
				<h3 className="text-lg font-medium text-gray-900 flex items-center">
					Встановлення цін
				</h3>
			</div>
			<table cellPadding={2} cellSpacing={6} className="w-full">
				<thead>
					<tr>
						<th className="text-start">Назва</th>
						<th className="text-start">Постачальника</th>
						<th className="text-start">Поточна</th>
						<th className="text-start">Націнка</th>
					</tr>
				</thead>
				<tbody>
					{document.products.map((product, i) => {
						return (
							<tr
								key={product.ref}
								className={`${product.retailPrice / product.supplierPrice < 1.32 && "bg-red-100 font-bold"} px-2 py-1.5 border`}
							>
								<td className="px-2">{product.name}</td>
								<td className="px-2">{product.supplierPrice}</td>
								<td className="px-2">
									<input
										className="w-12 border rounded px-1"
										value={product.retailPrice}
										onChange={(e) => changeProductPrice(i, e.target.value)}
									/>
								</td>
								<td className="">
									{Math.ceil(
										(product.retailPrice / product.supplierPrice) * 100 - 100,
									)}
									%
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
