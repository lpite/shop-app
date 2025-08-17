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
			<h3>Встановлення цін</h3>
			<table cellPadding={2} cellSpacing={6} className="w-full">
				<thead>
					<tr>
						<th className="text-start">Назва</th>
						<th className="text-start">Постачальника</th>
						<th className="text-start">поточна</th>
						<th className="text-start">націнка</th>
					</tr>
				</thead>
				<tbody>
					{document.products.map((product, i) => {
						const currentPrice =
							products?.find((el) => el.name === product.name)?.price || 0;
						return (
							<tr
								key={product.ref}
								className={`${product.retailPrice / product.supplierPrice < 1.3 && "bg-red-100"} px-2 py-1.5 border`}
							>
								<td className="px-2">{product.name}</td>
								<td className="px-2">{product.supplierPrice}</td>
								<td className="px-2">
									<input
										className="w-12 border rounded px-1"
										value={product.retailPrice}
										onChange={(e) =>
											changeProductPrice(i, e.target.value)
										}
									/>
								</td>
								<td className="">
									{(product.retailPrice / product.supplierPrice).toFixed(2)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
