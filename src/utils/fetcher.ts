import { ur } from "zod/locales";
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

const URL_MAPPINGS = {
	"GET: /shop/hs/app/agent-and-partner/": "/api/collections/client/records",
	"GET: /shop/hs/app/sell-document/z5md57r6fce9fyb":
		"/api/collections/sales_document/records?filter=client_id='z5md57r6fce9fyb'",
	"GET: /shop/hs/api/test":
		"/api/collections/products_with_stock_and_price/records",
	"POST: /shop/hs/app/sale-document": "/sales_document",
} as Record<string, string>;

const DATA_MAPPINGS = {
	"GET: /shop/hs/app/agent-and-partner/": (data: any) =>
		data.items.map((d: any) => ({
			partnerName: d.name,
			partnerId: d.id,
			agentName: d.name,
		})),
	"GET: /shop/hs/app/sell-document/z5md57r6fce9fyb": (d) => d.items[0].sum,
	"GET: /shop/hs/api/test": (d) =>
		d.items.map((el: any) => ({
			...el,
			code: "",
			vendorCode: "",
			place1: "",
			place2: "",
			place3: "",
		})),
	"POST: /shop/hs/app/sale-document": (r) => r,
} as Record<string, (s: any) => any>;

export async function fetcher<T>({
	url,
	method,
	query,
	body,
}: Fetcher): Promise<T> {
	const ip = localStorage.getItem("ip");

	const mappedUrl = URL_MAPPINGS[`${method}: ${url}`];
	const dataTransfromer = DATA_MAPPINGS[`${method}: ${url}`];
	if (!mappedUrl || !dataTransfromer) {
	}
	console.log(url, method, body, query);
	const result = fetch("http://localhost:8090" + mappedUrl + (query || ""), {
		method: method,
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then(async (res) => {
			let r = undefined;
			try {
				r = await res.clone().json();
			} catch (err) {
				r = await res.clone().text();
			}
			return r;
		})
		.then((r) => {
			console.log(r);
			return dataTransfromer(r);
		});
	return result;
}
