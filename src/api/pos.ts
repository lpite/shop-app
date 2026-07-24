import { FTSProduct } from "../types/product";
import { fetcher } from "../utils/fetcher";

type Sell = {
	partnerId: string;
	agentName: string;
	products: FTSProduct[];
};

async function sellProducts({ agentName, partnerId, products }: Sell) {
	const result = await fetcher<string>({
		url: `/shop/hs/app/sale-document`,
		method: "POST",
		body: {
			partnerId,
			agentName,
			products: products.map((el) => ({ ...el, searchCode: el.id.slice(7) })),
		},
	}).catch((err) => {
		console.error(err);
		return null;
	});

	if (result === "Успешно") {
		return true;
	} else {
		return false;
	}
}

async function getSellSum(partnerId: string) {
	return fetcher<string>({
		url: `/shop/hs/app/sell-document/${partnerId}`,
		method: "GET",
	});
}

type ReturnProducts = {
	partnerId: string;
	agentName: string;
	products: FTSProduct[];
};

async function returnProducts({
	partnerId,
	agentName,
	products,
}: ReturnProducts) {
	const result = await fetcher<string>({
		url: `/shop/hs/app/income-document/`,
		method: "POST",
		body: {
			partnerId,
			agentName,
			products: products.map((el) => ({ ...el, searchCode: el.id.slice(7) })),
		},
	}).catch((err) => {
		console.error(err);
		return null;
	});

	if (result === "Успешно") {
		return true;
	} else {
		return false;
	}
}

function getReturnSum() {
	return fetcher<string>({
		url: `/shop/hs/app/income-document`,
		method: "GET",
	});
}

function getComment(partnerId: string) {
	return fetcher<string>({
		url: `/shop/hs/app/comment/${partnerId}`,
		method: "GET",
	});
}

async function updateComment(partnerId: string, text: string) {
	await fetcher({
		url: `/shop/hs/app/comment/${partnerId}`,
		method: "POST",
		body: {
			partnerId,
			commentText: text,
		},
	});
}

export const pos = {
	sellProducts,
	returnProducts,
	getSellSum,
	getReturnSum,
	getComment,
	updateComment,
};
