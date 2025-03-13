import { Product } from "../types/product";

type FetchInputBase = {
	url: string;
	method: string;
	body?: any;
	query?: string;
	response?: any;
};

export interface ProductsGet extends FetchInputBase {
	url: "/shop/hs/app/product/";
	method: "GET";
	response: Product[];
}

export interface AgentsAndPartnersGet extends FetchInputBase {
	url: "/shop/hs/app/agent-and-partner/";
	method: "GET";
	response: { partnerName: string; agentName: string; partnerId: string }[];
}

export interface StatsGet extends FetchInputBase {
	url: "/shop/hs/app/stats/";
	method: "GET";
	response: {
		day: "yesterday" | "today";
		type: "sale" | "income";
		documentId: string;
		partnerName: string;
		partnerId: string;
		sum: number;
		comment: string;
		products: {
			searchCode: string;
			name: string;
			price: number;
			quantity: number;
			sum: number;
			place1: string;
			place2: string;
			place3: string;
		}[];
	}[];
}

export type FetchInputs =
	| ProductsGet["response"]
	| AgentsAndPartnersGet["response"];

type Fetcher = {
	url: string;
	method: string;
	query?: string;
	// body?: Record<string, string | number | string[] | number[] | undefined>;
	body?: any;
};

export async function fetcher<T>({
	url,
	method,
	query,
	body,
}: Fetcher): Promise<T> {
	const ip = localStorage.getItem("ip");

	const result = await fetch(`http://${ip}/1c_connector/index.php`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			url: url,
			method: method,
			query: query,
			body: body,
		}),
	})
		.then(async (res) => {
			let r = undefined;
			try {
				r = await res.clone().json();
			} catch (err) {
				console.error(err);
				r = await res.clone().text();
			}
			return r;
		})
		.catch((err) => {
			console.error(err);
			return undefined;
		});
	return result;
}
