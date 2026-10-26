import Show from "../utils/Show";
import useSWR from "swr";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { client } from "../api/client";

const disabledClients = [
	"00-00000059",
	"00-00000067",
	"УТ-00000003",
	"00-00000066",
	"00-00000131",
	"00-00000139",
];

const mainClients = ["00-00000034", "00-00000118", "УТ-00000002"];

export default function ClientSelectionPage() {
	const { data, isLoading } = useSWR("/clients/", client.getList);

	return (
		<main className="h-full flex flex-col items-center justify-center pt-2">
			{isLoading ? (
				<div className="h-20">
					<div className="animate-spin border border-blue-700 border-b-transparent border-solid w-8 h-8 rounded-full"></div>
				</div>
			) : null}
			{!isLoading && !data ? (
				<div className="h-20 mt-5 text-xl text-red-600 font-semibold">
					<h2>Помилка завантаження клієнтів :(</h2>
				</div>
			) : null}
			<Show when={!isLoading && !!data}>
				<h1 className="text-2xl">
					Оберіть клієнта для <b>Продажу</b>
				</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 mb-3 overflow-auto">
					{data &&
						data
							.filter(
								(client) => disabledClients.indexOf(client.partnerId) === -1,
							)
							.sort((a, b) => {
								const aIndex = mainClients.indexOf(a.partnerId);
								const bIndex = mainClients.indexOf(b.partnerId);

								if (aIndex > bIndex) {
									return -1;
								}
								if (aIndex < bIndex) {
									return 1;
								}
								return 0;
							})
							.map(({ partnerId, partnerName }) => (
								<Link
									key={partnerId}
									to={`/pos/${partnerId}/sell`}
									className={`w-72  p-2 border-2 rounded-lg flex items-center justify-between  hover:shadow-lg ${mainClients.indexOf(partnerId) !== -1 ? "h-24 text-xl font-medium bg-fuchsia-50" : ""}`}
								>
									{partnerName}
									<ChevronRight />
								</Link>
							))}
				</div>
				{/*{data &&
					data
						?.filter((client) => {
							if (client.agentName === "-" || client.partnerName === "-") {
								return false;
							}
							if (disabledClients.indexOf(client.partnerId) !== -1) {
								return false;
							}

							if (mainClients.indexOf(client.partnerId) !== -1) {
								return false;
							}

							return true;
						})

						.map(({ partnerId, partnerName }) => (
							<Link
								key={partnerId}
								to={`/pos/${partnerId}/sell`}
								className="w-60 px-4 py-2 bg-sky-600 font-medium text-white rounded-lg my-1"
							>
								{partnerName}
							</Link>
						))}*/}
			</Show>
		</main>
	);
}
