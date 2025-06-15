import useSWR from "swr";
import * as Dialog from "@radix-ui/react-dialog";

import { fetcher } from "../utils/fetcher";
import CommentPopup from "../components/comment-popup";
import { Link } from "wouter";
import { Suspense, useState } from "react";

export default function StatsPage() {
	const { data: stats, isLoading } = useSWR(
		"/stats/",
		() =>
			fetcher<any>({
				url: "/shop/hs/app/stats",
				method: "GET",
			}),
		{
			revalidateOnFocus: false,
		},
	);
	return (
		<>
			<header className="px-4 py-4">
				<Link to="/" className="bg-sky-300 px-6 py-3 rounded-lg font-medium">
					На головну
				</Link>
			</header>
			<main className="flex">
				{!isLoading &&
					["yesterday", "today"].map((day) => {
						const documents = stats?.filter((el: any) => el.day === day);
						return <Day day={day} documents={documents} key={day} />;
					})}
			</main>
		</>
	);
}
function Day({ day, documents }: { day: string; documents: any[] }) {
	return (
		<div className="w-3/6 flex flex-col items-center justify-start gap-3 mx-1">
			<h2 className="text-3xl">{day === "today" ? "Сьогодні" : "Вчора"}</h2>

			{documents &&
				documents?.map((doc, i) => (
					<div key={day + i} className="border-2 rounded-lg w-full p-2">
						{doc.type === "sale" ? (
							<>
								<span className="text-xl">Продаж</span>
								<span className="text-xl font-bold">{doc.partnerName}</span>
								<br />
								<br />

								<span className="text-xl font-bold"> {doc.sum} грн</span>
								<br />
								<div className="flex items-center">
									<span className="text-xl mr-3">Комментар:</span>
									<span className="text-md">{doc.comment || "Пусто..."}</span>
									{day === "today" ? (
										<CommentPopup partnerId={doc.partnerId} />
									) : null}
								</div>
							</>
						) : (
							<>
								<span className="text-xl mr-2">Повернення</span>
								<span className="text-xl font-bold mr-3">{doc.sum} грн</span>
							</>
						)}
						<ProductsPopup
							products={doc.products}
							documentType={doc.type === "sale" ? "Продаж" : "Повернення"}
							documentDay={day === "today" ? "cьогодні" : "вчора"}
							documentClient={doc.type === "sale" ? doc.partnerName : null}
						/>
					</div>
				))}
		</div>
	);
}

type Product = {
	searchCode: string;
	name: string;
	price: number;
	quantity: number;
	sum: number;
	place1: string;
	place2: string;
	place3: string;
	time: string;
};

type ProductsPopupProps = {
	documentType: string;
	documentClient: string;
	documentDay: string;
	products: Product[];
};

function ProductsPopup({
	products,
	documentDay,
	documentType,
	documentClient,
}: ProductsPopupProps) {
	return (
		<>
			<Dialog.Root>
				<Dialog.Trigger asChild>
					<button className="border-2 px-2 py-1 mt-3 rounded-md hover:bg-gray-200">
						Показати товари
					</button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
					<Dialog.Content className="fixed min-w-96 w-5/6 min-h-96 h-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
						<Dialog.Title className="text-xl mb-5">
							{documentType} {documentClient} {documentDay}
						</Dialog.Title>
						<div className="overflow-y-auto h-full">
							{Object.entries(
								products.reduce(
									(p, c) => {
										if (!p[c.time]) {
											p[c.time] = [];
										}
										p[c.time].push(c);
										return p;
									},
									{} as Record<string, Product[]>,
								),
							).map(([time, product]) => (
								<div className="border-2 rounded-lg my-4 px-2 py-2" key={time}>
									<div className="flex gap-2 mb-2">
										<span>{new Date(time).toLocaleString()}</span>
										<span className="font-semibold">
											Сума: {product.reduce((ac, c) => ac + c.sum, 0)} грн
										</span>
									</div>

									{product.map((el) => (
										<div className="flex py-1" key={time + el.searchCode}>
											<div style={{ width: 50 }} className="border-b-2">
												{el.searchCode}
											</div>
											<div className="flex-1 border-b-2">{el.name}</div>
											<div
												style={{ width: 88 }}
												className="border-b-2 border-s-2 px-1"
											>
												{el.price} грн
											</div>
											<div
												style={{ width: 50 }}
												className="border-b-2 border-s-2 px-1"
											>
												{el.quantity}
											</div>
											<div
												style={{ width: 98 }}
												className="border-b-2 border-s-2 px-1 font-semibold"
											>
												{el.sum} грн
											</div>
											<div className="border-b-2 border-s-2 px-1 w-2/6 gap-3 flex">
												{[el.place1, el.place2, el.place3]
													.filter((el) => el.length)
													.map((place) => (
														<span key={time + el.name + place}>{place}</span>
													))}
											</div>
										</div>
									))}
								</div>
							))}
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
