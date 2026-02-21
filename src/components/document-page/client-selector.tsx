import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { AgentsAndPartnersGet, fetcher } from "../../utils/fetcher";
import useSWR from "swr";
import { useConfig } from "../../stores/configStore";
import { Link } from "wouter";
import { ChevronDown, ChevronRight } from "lucide-react";
const mainClients = ["00-00000034", "00-00000118", "УТ-00000002"];
const disabledClients = [
	"00-00000059",
	"00-00000067",
	"УТ-00000003",
	"00-00000066",
	"00-00000131",
	"00-00000139",
];

type ClientSelectorProps = {
	partnerId?: string;
};

export function ClientSelector({ partnerId }: ClientSelectorProps) {
	const { use_fancy_pos } = useConfig();

	const [isOpen, setIsOpen] = useState(false);

	const { data: clients, isLoading: isLoadingClients } = useSWR(
		"/clients/",
		() =>
			fetcher<AgentsAndPartnersGet["response"]>({
				url: "/shop/hs/app/agent-and-partner/",
				method: "GET",
			}),
	);

	const posUrl = use_fancy_pos ? "pos-new" : "pos";

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger asChild>
				<button className="px-3 h-10 min-w-48 border-2 rounded-lg flex items-center justify-between gap-3 hover:bg-gray-200">
					{clients?.find((client) => client.partnerId === partnerId)
						?.agentName || "..."}
					<ChevronDown className="size-5" />
				</button>
			</Dialog.Trigger>
			<Dialog.Overlay className="fixed z-10 inset-0 bg-black bg-opacity-25" />
			<Dialog.Content className="fixed z-10 min-h-96 w-3/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
				<Dialog.Title className="text-2xl pb-3 font-medium">
					Клієнти
				</Dialog.Title>
				<div className="flex gap-2">
					{!isLoadingClients &&
						clients &&
						clients
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
									to={`/${posUrl}/${partnerId}/sell`}
									className="w-1/3 h-24 p-2 border-2 rounded-lg flex items-center justify-between text-xl font-medium hover:shadow-lg"
									onClick={() => setIsOpen(false)}
								>
									{partnerName}
									<ChevronRight />
								</Link>
							))}
				</div>
				<div className="grid grid-cols-3 gap-2 mt-3 ">
					{!isLoadingClients &&
						clients &&
						clients
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
									to={`/${posUrl}/${partnerId}/sell`}
									className="px-4 py-2 bg-sky-600 font-medium text-white rounded-lg"
									onClick={() => setIsOpen(false)}
								>
									{partnerName}
								</Link>
							))}
				</div>
			</Dialog.Content>
		</Dialog.Root>
	);
}
