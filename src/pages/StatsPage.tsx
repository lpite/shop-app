import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import CommentPopup from "../components/comment-popup";

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
		<main className="flex">
			{!isLoading &&
				["yesterday", "today"].map((day) => {
					const documents = stats?.filter((el: any) => el.day === day);
					return <Day day={day} documents={documents} key={day} />;
				})}
			<div></div>
		</main>
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
								<span className="text-xl mr-3">Комментар</span>
								<span className="text-xl">{doc.comment}</span>
								{day === "today" ? (
									<CommentPopup partnerId={doc.partnerId} />
								) : null}
							</>
						) : (
							<>
								<span className="text-xl mr-2">Повернення</span>
								<span className="text-xl font-bold">{doc.sum} грн</span>
							</>
						)}
					</div>
				))}
		</div>
	);
}
