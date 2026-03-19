import { AgentsAndPartnersGet, fetcher } from "../utils/fetcher";

function getList() {
	return fetcher<AgentsAndPartnersGet["response"]>({
		url: "/shop/hs/app/agent-and-partner/",
		method: "GET",
	});
}

async function getOne(partnerId: string) {
	const list = await getList();
	return list.find((el) => el.partnerId === partnerId);
}

export const client = { getList, getOne };
