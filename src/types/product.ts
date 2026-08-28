export type Product = {
	ref: string;
	searchCode: string;
	name: string;
	brand: string;
	vendorCode: string;
	code: string;
	price: number;
	quantity: number;
	units: string;
	place1: string;
	place2: string;
	place3: string;
	photo: string;
	photoPath: string;
	description: string;
	needToSell: boolean;
};

export type FTSProduct = {
	id: string;
	article: string;
	oem: string;
	name: string;
	brand: string;
	units: string;
	places: string[];
	photoUrl: string;
	description: string;
	needToSell: boolean;
	foundBy: string;
	price: number;
	quantity: number;
};
