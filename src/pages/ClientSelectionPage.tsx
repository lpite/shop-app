import { AgentsAndPartnersGet } from "../utils/fetcher";
import Show from "../utils/Show";
import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { Fragment } from "react/jsx-runtime";
import { Link } from "wouter";

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
	const { data, isLoading } = useSWR("/clients/", () =>
		fetcher<AgentsAndPartnersGet["response"]>({
			url: "/shop/hs/app/agent-and-partner/",
			method: "GET",
		}),
	);

	return (
		<main className="h-full flex flex-col items-center justify-center">
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
				<div className="flex gap-4 mt-12 mb-3">
					{data
						?.filter((client) => mainClients.indexOf(client.partnerId) !== -1)
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
								to={`/document/${partnerId}/sell`}
								className="w-72 h-24 p-2 border-2 rounded-lg flex items-center justify-between text-xl font-medium hover:shadow-lg"
							>
								{partnerName}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path
										fillRule="evenodd"
										d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
									/>
								</svg>
							</Link>
						))}
				</div>
				{data
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
							to={`/document/${partnerId}/sell`}
							className="w-60 px-4 py-2 bg-sky-600 font-medium text-white rounded-lg my-1"
						>
							{partnerName}
						</Link>
					))}
			</Show>
		</main>
	);
}
