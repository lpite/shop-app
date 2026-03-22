type GetArticleDetails = {
	brand: string;
	article: string;
};

export type CatalogTreeItem = {
	name: string;
	product_id: number;
	parent: string;
	id: string;
};

export type CatalogProduct = { article: string; supplier: string };

const catalog_url = "http://localhost:3000";

async function getArticleDetails({
	article,
	brand,
}: GetArticleDetails): Promise<{
	oems: { oem: string; manufacturer: string }[];
	type: string;
	information: any[];
	attributes: { title: string; value: string }[];
}> {
	return fetch(
		`${catalog_url}/catalog/brands/${brand}/articles/${article}`,
	).then((r) => r.json());
}

function getCarBrands(): Promise<{ id: number; name: string }[]> {
	return fetch(`${catalog_url}/brands`).then((r) => r.json());
}

function getCarModels(
	brandId: number,
): Promise<{ id: number; name: string }[]> {
	return fetch(`${catalog_url}/brands/${brandId}/models`).then((r) => r.json());
}

async function getCarEngines(modelId: number): Promise<
	{
		id: number;
		shortName: string;
		name: string;
		dateFrom: string;
		dateTo: string;
		codes: string[];
	}[]
> {
	return fetch(`${catalog_url}/models/${modelId}/engines`).then((r) =>
		r.json(),
	);
}

async function getProductsByEngine(
	engineId: number,
): Promise<CatalogProduct[]> {
	return fetch(`${catalog_url}/engines/${engineId}/products`).then((r) =>
		r.json(),
	);
}

async function getProductBrands() {}

async function getProductTree(): Promise<CatalogTreeItem[]> {
	return fetch(
		`http://localhost:8090/api/collections/catalog_product_tree/records`,
	)
		.then((r) => r.json())
		.then((r) => r.items);
}

export const catalog = {
	getArticleDetails,
	getCarBrands,
	getCarModels,
	getCarEngines,
	getProductBrands,
	getProductsByEngine,
	getProductTree,
};
