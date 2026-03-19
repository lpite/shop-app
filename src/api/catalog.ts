type GetArticleDetails = {
	brand: string;
	article: string;
};

async function getArticleDetails({ article, brand }: GetArticleDetails) {
	console.log(article,brand)
	return { oems: [], attributes: [] };
}

export const catalog = {
	getArticleDetails,
};
