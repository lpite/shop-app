import { AgentsAndPartnersGet, fetcher } from "../../utils/fetcher";
import useSWR from "swr";
import { useAppStore } from "../../stores/useAppStore";
import SearchForm from "./search-form";
import CommentPopup from "../comment-popup";
import CatalogPopup from "./catalog";
import { Link, useParams } from "wouter";
import SearchHistoryPopup from "../search-history-popup";
import { useSearch } from "../../hooks/useSearch";

export default function Header() {
	const { partnerId, type } = useParams();

	const cartProducts = useAppStore((state) => state.cartProducts);
	const clearCart = useAppStore((state) => state.clearCart);

	const { setQuery, clearData } = useSearch({ fts: true });

	const { data: agentAndPartner } = useSWR("/clients/", () =>
		fetcher<AgentsAndPartnersGet["response"]>({
			url: "/shop/hs/app/agent-and-partner/",
			method: "GET",
		}),
	);
	const { data: documentSum } = useSWR(`/document-sum/${partnerId}`, () =>
		fetcher<string>({
			url: `/shop/hs/app/sell-document/${partnerId}`,
			method: "GET",
		}),
	);

	async function saveCart() {
		if (!confirm("Дійсно перенести?")) {
			return;
		}

		if (!agentAndPartner) {
			alert("йой");
		}
		const agentName = agentAndPartner?.find(
			(el) => el.partnerId === partnerId,
		)?.agentName;

		if (!agentName) {
			alert("йой");
		}

		const res = await fetcher<string>({
			url: `/shop/hs/app/sale-document`,
			method: "POST",
			body: {
				partnerId,
				agentName: agentName,
				products: cartProducts.map((p) => ({
					...p,
					searchCode: "0".repeat(4 - p.searchCode.length) + p.searchCode,
				})),
			},
		});
		if (res === "Успешно") {
			clearCart();
			useAppStore.setState({ searchValue: "" });
			setQuery("");
			clearData();
		} else {
			alert(res);
		}
	}

	return (
		<header className="w-full gap-2 p-2 grid grid-rows-2 grid-cols-12 h-38 bg-slate-100">
			<div className="flex gap-2 col-start-1 col-span-3">
				<Link
					to={"/"}
					className="px-4 h-10 border-2 rounded-lg bg-slate-300 flex items-center hover:bg-sky-200"
				>
					Головна
				</Link>
				{type === "sell" ? (
					<Link
						to={"/clients"}
						className="px-3 h-10 border-2 rounded-lg bg-slate-300 flex items-center hover:bg-sky-200"
					>
						Клієнти
					</Link>
				) : null}
				<Link
					to="/stats"
					className="px-3 h-10 border-2 rounded-lg bg-slate-300 flex items-center hover:bg-sky-200"
				>
					Статистика
				</Link>
			</div>
			<div className="col-start-4 col-end-13 w-full flex justify-end gap-4">
				<Link
					to="/suppliers-search"
					className="flex items-center px-2 border-2 h-10 rounded-lg"
				>
					Постачальники
				</Link>
				<Link
					to="/vin-demo"
					className="flex items-center px-2 border-2 h-10 rounded-lg"
				>
					Vin
				</Link>
				<SearchHistoryPopup />
				<CatalogPopup />
				<CommentPopup partnerId={partnerId || ""} buttonText="Коментар" />
				<div className="text-xl w-96 flex flex-col items-end">
					{type === "sell" ? (
						<b>
							Продаж -{" "}
							{
								agentAndPartner?.find((el) => el.partnerId === partnerId)
									?.agentName
							}
						</b>
					) : (
						"Повернення"
					)}
					<br />
					<span>Сума - {documentSum}₴</span>
				</div>
			</div>
			<div className="col-start-10 col-end-13 justify-self-end">
				<button
					onMouseDown={saveCart}
					disabled={!cartProducts.length}
					className="bg-green-500 disabled:bg-slate-200 hover:bg-green-400 px-4 py-2 rounded-lg shadow-lg text-slate-900 font-medium"
				>
					Перенести в документ
				</button>
			</div>
			<SearchForm />
		</header>
	);
}
