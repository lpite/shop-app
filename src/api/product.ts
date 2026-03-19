import { fetcher } from "../utils/fetcher";

async function getPhotos(productId: string) {
	const product = await fetcher<any>({
		url: `/shop/odata/standard.odata/Catalog_Номенклатура?$format=json&$filter=Code eq '${productId}'`,
		method: "GET",
	});
	const Ref_Key: string | null = product?.value[0]?.Ref_Key;
	if (!Ref_Key) {
		console.error("no Ref_Key");
		return [];
	}
	const photos = await fetcher<any>({
		url: `/shop/odata/standard.odata/Catalog_НоменклатураПрисоединенныеФайлы?$format=json&$filter=ВладелецФайла_Key eq guid'${Ref_Key}'`,
		method: "GET",
	});

	if (!("value" in photos)) {
		return [];
	}
	return photos.value.map(
		(photo: { ПутьКФайлу: string }) => photo.ПутьКФайлу,
	) as string[];
}

export const product = { getPhotos };
