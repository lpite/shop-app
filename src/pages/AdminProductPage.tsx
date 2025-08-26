import { Ellipsis, FilePlus2, Save, Search, X } from "lucide-react";
import useSWR from "swr";
import { useParams } from "wouter";
import { fetcher } from "../utils/fetcher";
import { Spinner } from "../components/spinner";

import * as Dialog from "@radix-ui/react-dialog";

type Product = {
	Ref_Key: string;
	Code: string;
	Description: string;
	Артикул: string;
	ОригинальныйНомер: string;
	НаименованиеПолное: string;
	НаименованиеПолноеИнтернетМагазин: string;
	Производитель_Key: string;
	МестоХаренияНаМагазине_Key: string;
	МестоХранения_Key: string;
};

export function AdminProductPage() {
	const { ref } = useParams();
	const { data: product, mutate: mutateProduct } = useSWR(
		`/product/${ref}`,
		() =>
			fetcher<Product>({
				method: "GET",
				url: `/shop/odata/standard.odata/Catalog_Номенклатура(guid'${ref}')?$format=json`,
			}),
	);

	function changeProduct(p: any) {
		console.log(p);
		mutateProduct(
			{ ...product, ...p },
			{
				revalidate: false,
			},
		);
	}

	async function saveProduct() {
		await fetcher<any>({
			method: "PATCH",
			url: `/shop/odata/standard.odata/Catalog_Номенклатура(guid'${ref}')?$format=json`,
			body: product,
		});
	}

	return (
		<div className="flex flex-col lg:flex-row px-5 py-2 bg-gray-100 min-h-full gap-2">
			<main className="flex-1">
				<div className="flex flex-col gap-2 bg-white p-2 border rounded-lg">
					<div className="flex items-center gap-2">
						<button className="px-3 py-1.5 border rounded-lg bg-yellow-200 ">
							Зберегти та закрити
						</button>
						<button
							onClick={saveProduct}
							className="p-1.5 rounded-lg hover:bg-gray-200"
						>
							<Save />
						</button>
						<button className="p-1.5 rounded-lg hover:bg-gray-200">
							<FilePlus2 />
						</button>
						<label>Код: {product?.Code}</label>
					</div>
					<div className="flex gap-2">
						<label>
							Артикул:
							<input
								value={product?.Артикул || ""}
								className="border flex-1"
								type="text"
							/>
						</label>
						<label>
							<input className="border flex-1" type="text" />
						</label>
						<label>
							OEM:
							<input
								value={product?.ОригинальныйНомер || ""}
								className="border flex-1"
								type="text"
							/>
						</label>
					</div>
					<label className="w-full flex">
						<span className="w-36">Назва:</span>
						<input
							value={product?.Description || ""}
							onChange={(e) => changeProduct({ Description: e.target.value })}
							className="border flex-1"
							type="text"
						/>
					</label>
					<label className="w-full flex">
						<span className="w-36">Назва для друку:</span>
						<input
							value={product?.НаименованиеПолное || ""}
							className="border flex-1"
							type="text"
						/>
					</label>
					<label className="w-full flex">
						<span className="w-36">Назва для сайту:</span>
						<input
							value={product?.НаименованиеПолноеИнтернетМагазин || ""}
							className="border flex-1"
							type="text"
						/>
					</label>
				</div>
				<div className="flex flex-col md:flex-row border rounded-lg mt-6 p-2 bg-white gap-2">
					<div className="flex-1 flex flex-col gap-2">
						<div className="flex flex-col md:flex-row gap-2">
							<label className="flex-1">
								Місце 1:
								<CatalogSelect
									catalogName="Catalog_Производители"
									ref={product?.Производитель_Key}
								/>
							</label>
							<label className="flex-1">
								Місце 2:
								<CatalogSelect
									catalogName="Catalog_Производители"
									ref={product?.МестоХаренияНаМагазине_Key}
								/>
							</label>
							<label className="flex-1">
								Місце 3:
								<CatalogSelect
									catalogName="Catalog_МестаХранения"
									ref={product?.МестоХранения_Key}
								/>
							</label>
						</div>
						<div className="flex flex-col md:flex-col gap-4">
							<label className="flex-1 flex flex-col">
								Виробник:
								<CatalogSelect
									catalogName="Catalog_ПроизводителиРеальные"
									ref={product?.ПроизводительРеальный_Key}
								/>
							</label>
							<label className="flex-1 flex flex-col">
								Постачальник
								<CatalogSelect
									catalogName="Catalog_ПоставщикиРеальные"
									ref={product?.ПоставщикРеальный_Key}
								/>
							</label>
							<label className="flex flex-col flex-1">
								Постачальник 2
								<CatalogSelect
									catalogName="Catalog_ПоставщикиРеальные"
									ref={product?.ПоставщикРеальный1_Key}
								/>
							</label>
						</div>
					</div>
					<div className="">
						<div className="flex flex-col">
							<label>Вид номенклатури</label>
							<label className="flex gap-2">
								Одиниці зберігання
								<CatalogSelect
									catalogName="Catalog_ЕдиницыИзмерения"
									ref={product?.ЕдиницаИзмерения_Key}
								/>
							</label>
							<label>Группа номенклатури</label>
							<label>
								Цінова група
								<CatalogSelect
									catalogName="Catalog_ЦеновыеГруппы"
									ref="c31d8d99-b8ad-11e3-864b-10feed048384"
								/>
							</label>
							<label>Група фінансового обліку</label>
						</div>
					</div>
				</div>
			</main>
			<aside className="min-w-96 bg-white rounded-lg p-2">
				<img
					className="h-72 w-full object-contain"
					src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/960px-Cat_November_2010-1a.jpg"
					alt="img"
				/>
				<div>
					<button>
						<X />
					</button>
					<button>Список фото</button>
				</div>
			</aside>
		</div>
	);
}

type CatalogSelect = {
	ref?: string;
	catalogName: string;
	changeProduct;
};

function CatalogSelect({ ref, catalogName }: CatalogSelect) {
	const { data, isLoading, isValidating } = useSWR(
		`catalog/${catalogName}`,
		() =>
			fetcher<{ value: { Ref_Key: string; Description: string }[] }>({
				url: `/shop/odata/standard.odata/${catalogName}?$format=json`,
				method: "GET",
			}).then((r) => r.value),
	);
	return (
		<div className="border flex p-1 rounded-lg h-8">
			{isLoading && <Spinner size={4} />}
			<span className="flex-1">
				{data?.find((el) => el.Ref_Key === ref)?.Description}
			</span>
			<div className="flex gap-1">
				{ref && (
					<button>
						<X className="h-4 w-4" />
					</button>
				)}
				<Dialog.Root>
					<Dialog.Trigger>
						<Ellipsis className="h-4 w-4" />
					</Dialog.Trigger>
					<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
					<Dialog.Content className="flex flex-col fixed w-4/6 h-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
						<Dialog.Title className="text-2xl pb-3 font-medium">
							{catalogName}
						</Dialog.Title>
						<form>
							<input />
						</form>
						<div className="flex-1 overflow-y-auto">
							{data?.map((el) => <div key={el.Ref_Key}>{el.Description}</div>)}
						</div>
					</Dialog.Content>
				</Dialog.Root>
				<button>
					<Search className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
