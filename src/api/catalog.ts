type GetArticleDetails = {
	brand: string;
	article: string;
};

const catalog_url = "http://localhost:3000";

async function getArticleDetails({ article, brand }: GetArticleDetails) {
	return fetch(
		`${catalog_url}/catalog/brands/${brand}/articles/${article}`,
	).then((r) => r.json());
}

function getCarBrands() {
	return fetch(`${catalog_url}/brands`).then((r) => r.json());
}

function getCarModels(brandId: number) {
	return fetch(`${catalog_url}/brands/${brandId}/models`).then((r) => r.json());
}

async function getProductBrands() {}

export const catalog = {
	getArticleDetails,
	getCarBrands,
	getCarModels,
	getProductBrands,
};
