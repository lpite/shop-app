import { useEffect } from "react";
import useSWR from "swr";
import { Link, useParams } from "wouter";
import { House } from "lucide-react";

import SearchForm from "./search-form";
import CommentPopup from "../comment-popup";
import { CatalogDialog } from "./catalog-dialog";
import SearchHistoryPopup from "../search-history-popup";
import { getPageColor } from "../../utils/getPageColor";
import { ClientSelector } from "./client-selector";

import { useSearch } from "../../hooks/useSearch";

import { pos } from "../../api/pos";
import { client } from "../../api/client";

import { useCartStore } from "../../stores/cart-store";

export default function Header() {
	const { partnerId, type } = useParams();
	const { cartProducts, clearCart } = useCartStore();

	const { setQuery, clearData } = useSearch({ fts: true });

	const { data: agentAndPartner } = useSWR(partnerId ? "clients/" : null, () =>
		client.getOne(partnerId || ""),
	);
	const { data: documentSum } = useSWR(
		partnerId ? `document-sum/${partnerId}` : null,
		() => pos.getSum(partnerId || ""),
	);

	async function saveCart() {
		if (!cartProducts.length) {
			return;
		}

		if (!confirm("Дійсно перенести?")) {
			return;
		}

		if (!agentAndPartner) {
			alert("йой");
		}
		const agentName = agentAndPartner?.agentName;

		if (!agentName) {
			console.error("no agentName");
			return;
		}

		if (!partnerId) {
			console.error("no partnerId");
			return;
		}

		if (
			await pos.sellProducts({ agentName, partnerId, products: cartProducts })
		) {
			clearCart();
			setQuery("");
			clearData();
		} else {
			alert("Не вдалося перенести!");
		}
	}

	useEffect(() => {
		function listener(e: KeyboardEvent) {
			if (e.key === "F9" && e.target === document.body) {
				saveCart();
			}
		}
		document.addEventListener("keydown", listener);
		return () => document.removeEventListener("keydown", listener);
	}, [saveCart]);

	return (
		<header
			className={`w-full gap-2 p-2 grid grid-rows-2 grid-cols-12 h-38 ${getPageColor(partnerId, type) || "bg-slate-100"}`}
		>
			<div className="flex gap-2 col-start-1 col-span-3">
				<Link
					to="/"
					className="h-10 border border-gray-300 rounded-lg bg-slate-200 hover:shadow-md flex items-center justify-center gap-2 px-3"
				>
					<House />
					Головна
				</Link>
				<Link
					to="/stats"
					className="h-10 border border-gray-300 rounded-lg bg-slate-200 hover:shadow-md flex items-center justify-center gap-2 px-3"
				>
					Статистика
				</Link>
			</div>
			<div className="col-start-4 col-end-13 w-full flex justify-end gap-4">
				<SearchHistoryPopup />
				<CatalogDialog />
				<CommentPopup partnerId={partnerId || ""} buttonText="Коментар" />
				<div className="text-xl w-96 flex flex-col items-end">
					{type === "sell" ? (
						<div className="flex items-center gap-2">
							<b>Продаж</b>
							<ClientSelector partnerId={partnerId} />
						</div>
					) : (
						"Повернення"
					)}
					<br />
					<span>
						Сума
						<span className="pl-4 opacity-0 hover:opacity-100 inline-block min-w-24 text-end">
							{documentSum}
						</span>
						₴
					</span>
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
