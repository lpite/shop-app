import { useState } from "react";
import useSWR from "swr";
import * as Dialog from "@radix-ui/react-dialog";
import {
	ArrowDown,
	ArrowDownUp,
	ArrowLeft,
	ArrowUp,
	Check,
	ChevronLeft,
	Folder,
	MapPin,
	Pencil,
	Tags,
	X,
} from "lucide-react";

import { Spinner } from "../components/spinner";
import { fetcher } from "../utils/fetcher";

import useSWRMutation from "swr/mutation";
import { create } from "zustand";

const halfOfYear = 15552000000;

const EMPTY_REF = "00000000-0000-0000-0000-000000000000";

type ReportStore = {
	productTags: Record<string, Tag[]>;
	sortBy: "id" | "name" | "lastSellDate" | "suggestion";
	sortOrder: "asc" | "desc";
	filterValue: "keep" | "move-further" | "move-closer" | "all";
	filterTag: Tag | "__all__";
	page: number;
	toggleProductTag: (product_ref: string, tag: Tag) => void;
};

const useReportStore = create<ReportStore>()((set) => ({
	productTags: {},
	sortBy: "lastSellDate",
	sortOrder: "asc",
	filterValue: "all",
	filterTag: "__all__",
	page: 1,

	toggleProductTag: (product_ref, tag) =>
		set((state) => {
			const current = state.productTags[product_ref] ?? [];
			const exists = current.includes(tag);

			return {
				productTags: {
					...state.productTags,
					[product_ref]: exists
						? current.filter((t) => t !== tag)
						: [...current, tag],
				},
			};
		}),
}));

type Tag = "__untagged__" | "cant-move" | "planned" | "moved";

const allTags: { tag: Tag; label: string }[] = [
	{ tag: "cant-move", label: "Неможливо перемістити" },
	{ tag: "planned", label: "Заплановано" },
	{ tag: "moved", label: "Переміщено" },
];

type ProductRow = {
	ref: string;
	lastSellDate: null | string;
	stock: number;
	name: string;
	id: string;
	place1: null | string;
	place2: null | string;
	place3: null | string;
	suggestion?: "keep" | "move-further" | "move-closer";
};

export default function PlaceChangeSuggestionReport() {
	const { data, isLoading } = useSWR("/report/place-change-suggestion", () =>
		fetcher<ProductRow[]>({
			url: "/shop/hs/reports/universal/",
			method: "POST",
			body: `ВЫБРАТЬ РеализацияТоваровУслугТовары.Номенклатура КАК Номенклатура,МАКСИМУМ(РеализацияТоваровУслугТовары.Ссылка.Дата) КАК ДатаПоследнейРеализации ПОМЕСТИТЬ ПоследниеПродажи ИЗ Документ.РеализацияТоваровУслуг.Товары КАК РеализацияТоваровУслугТовары ГДЕ РеализацияТоваровУслугТовары.Ссылка.Проведен = ИСТИНА СГРУППИРОВАТЬ ПО РеализацияТоваровУслугТовары.Номенклатура; ВЫБРАТЬ ПоследниеПродажи.ДатаПоследнейРеализации КАК lastSellDate, СУММА(ТоварыНаСкладахОстатки.ВНаличииОстаток) КАК stock, ТоварыНаСкладахОстатки.Номенклатура.Код КАК id,ТоварыНаСкладахОстатки.Номенклатура.Ссылка КАК ref,  ТоварыНаСкладахОстатки.Номенклатура.Наименование КАК name, ТоварыНаСкладахОстатки.Номенклатура.МестоХранения.Код КАК place1, ТоварыНаСкладахОстатки.Номенклатура.МестоХранения1.Код КАК place2, ТоварыНаСкладахОстатки.Номенклатура.МестоХранения2.Код КАК place3 ИЗ РегистрНакопления.ТоварыНаСкладах.Остатки КАК ТоварыНаСкладахОстатки ЛЕВОЕ СОЕДИНЕНИЕ ПоследниеПродажи ПО ТоварыНаСкладахОстатки.Номенклатура = ПоследниеПродажи.Номенклатура ГДЕ ТоварыНаСкладахОстатки.ВНаличииОстаток <> 0 СГРУППИРОВАТЬ ПО ТоварыНаСкладахОстатки.Номенклатура.Код, ТоварыНаСкладахОстатки.Номенклатура.Наименование, ТоварыНаСкладахОстатки.Номенклатура.МестоХранения2, ПоследниеПродажи.ДатаПоследнейРеализации, ТоварыНаСкладахОстатки.Номенклатура.МестоХранения,ТоварыНаСкладахОстатки.Номенклатура.Ссылка, ТоварыНаСкладахОстатки.Номенклатура.МестоХранения1`,
		}),
	);

	const filterValue = useReportStore((s) => s.filterValue);
	const filterTag = useReportStore((s) => s.filterTag);

	const sortBy = useReportStore((s) => s.sortBy);
	const sortOrder = useReportStore((s) => s.sortOrder);
	const page = useReportStore((s) => s.page);
	const setPage = (page: number) => useReportStore.setState({ page });

	const sortedData =
		(data &&
			data
				.map((item) => {
					const currentDate = new Date().getTime();
					const itemLastSellDate = item.lastSellDate
						? new Date(item.lastSellDate).getTime()
						: 0;

					let suggestion: "keep" | "move-further" | "move-closer" = "keep";

					if ((item.place1 || item.place2) && !itemLastSellDate) {
						suggestion = "move-further";
					}
					if (
						item.place3 &&
						!item.place1 &&
						!item.place2 &&
						currentDate - itemLastSellDate < halfOfYear
					) {
						suggestion = "move-closer";
					}

					return {
						...item,
						lastSellDate: itemLastSellDate,
						suggestion: suggestion,
					};
				})
				.filter((item) => {
					if (filterValue === "all") {
						return true;
					}
					return item.suggestion === filterValue;
				})
				.filter((item) => {
					const itemTags =
						useReportStore.getState().productTags[item.ref] ?? [];
					if (filterTag === "__all__") {
						return true;
					}

					if (filterTag === "__untagged__" && !itemTags.length) {
						return true;
					}

					if (!itemTags.length) {
						return false;
					}

					if (itemTags.includes(filterTag)) {
						return true;
					}
					return false;
				})
				.sort((item1, item2) => {
					if (item1[sortBy] > item2[sortBy]) {
						return sortOrder === "asc" ? 1 : -1;
					} else if (item1[sortBy] < item2[sortBy]) {
						return sortOrder === "asc" ? -1 : 1;
					} else {
						return 0;
					}
				})
				.slice((page - 1) * 100, page * 100)) ||
		[];

	return (
		<main className="flex flex-col w-full h-full px-5 py-3">
			<ReportControls />
			<div className="mt-6 w-full flex justify-between items-center">
				<span>
					<span className="text-gray-500">Відображення</span> 100{" "}
					<span className="text-gray-500">товарів з</span> {data?.length}
				</span>
			</div>
			<div className="mt-4 bg-gray-100 rounded-xl flex">
				{isLoading ? <Spinner size={50} /> : null}
				<div className="lg:hidden overflow-visible w-full">
					{sortedData.map((item) => (
						<div
							key={item.id + "_mobile"}
							className="rounded-lg border p-3 mb-1 flex w-full"
						>
							<div className="grow">
								<div className="w-28">
									<SuggestionTag suggestion={item.suggestion} />
								</div>
								<div className="flex flex-col py-2">
									<span>{item.name}</span>
									<span className="text-gray-600 text-sm">{item.id}</span>
								</div>
								<div className="flex gap-2">
									<span>
										<span className="text-gray-600">Залишок: </span>
										{item.stock}
									</span>
									<span>
										<span className="text-gray-600">Без руху: </span>
										{(item.lastSellDate &&
											Math.ceil(
												(new Date().getTime() - item.lastSellDate) /
													1000 /
													60 /
													60 /
													24,
											)) ||
											"- "}
										днів
									</span>
								</div>
								<div className="pt-2 flex gap-2 items-center">
									<MapPin className="size-5 text-gray-600" />
									{item.place1 && <span>{item.place1}</span>}
									{item.place2 && <span>{item.place2}</span>}
									<span>{item.place3}</span>
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<EditProductDialog product={item} />
								<TagSelectorDialog product_ref={item.ref} />
							</div>
						</div>
					))}
				</div>
				<table className="hidden lg:table w-full">
					<thead className="">
						<tr>
							<th className="text-gray-600 py-3 px-1">
								<SortLabel label="Код" property="id" />
							</th>
							<th className="text-gray-600">
								<SortLabel label="Товар" property="name" className="px-5" />
							</th>
							<th className="w-52 text-gray-600">
								<SortLabel label="Останній продаж" property="lastSellDate" />
							</th>
							<th className="w-28 text-gray-600">
								<SortLabel label="Пропозиція" property="suggestion" />
							</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{sortedData.slice(0, 100).map((el) => (
							<tr key={el.id} className="border-b min-h-10 hover:bg-gray-50">
								<td className="py-5 pl-3 text-gray-600">{el["id"]}</td>
								<td className="px-5">
									<span className="flex flex-col">
										<span className="col-span-3">{el["name"]}</span>
										<span className="flex gap-3 text-gray-600 text-sm">
											{el["place1"] && <span>{el["place1"]}</span>}
											{el["place2"] && <span>{el["place2"]}</span>}
											<span>{el["place3"]}</span>
										</span>
									</span>
								</td>
								<td>
									{(el["lastSellDate"] &&
										new Date(el["lastSellDate"])?.toLocaleDateString()) || (
										<span className="text-gray-500 italic">Ніколи</span>
									)}
								</td>
								<td>
									<SuggestionTag suggestion={el.suggestion} />
								</td>
								<td>
									<span className="flex gap-2">
										<EditProductDialog product={el} />
										<TagSelectorDialog product_ref={el.ref} />
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="py-6 flex justify-between">
				<button
					className="border p-2 disabled:opacity-0"
					onClick={() => setPage(page - 1)}
					disabled={page === 1}
				>
					Попередня сторінка
				</button>
				<button
					className="border p-2"
					onClick={() => {
						setPage(page + 1);
						window.scrollTo({
							top: 0,
							behavior: "smooth",
						});
					}}
				>
					Наступна сторінка
				</button>
			</div>
		</main>
	);
}

function ReportControls() {
	const filterValue = useReportStore((s) => s.filterValue);
	const setFilterValue = (filterValue: ReportStore["filterValue"]) =>
		useReportStore.setState({ filterValue });

	const filterTag = useReportStore((s) => s.filterTag);

	const setFilterTag = (filterTag: ReportStore["filterTag"]) =>
		useReportStore.setState({ filterTag });

	return (
		<div className="w-full flex flex-col md:flex-row gap-2">
			<label className="flex flex-col w-48">
				Тип
				<select
					className="rounded-lg px-3 py-2 text bg-gray-100 hover:bg-gray-50 border border-gray-300 cursor-pointer"
					onChange={(e) => setFilterValue(e.target.value as any)}
					value={filterValue}
				>
					<option value="all">Всі</option>
					<option value="move-closer">Перемістити ближче</option>
					<option value="move-further">Перемістити далі</option>
					<option value="keep">Не чіпати</option>
				</select>
			</label>
			<label className="flex flex-col w-48">
				Теги
				<select
					className="rounded-lg px-3 py-2 text bg-gray-100 hover:bg-gray-50 border border-gray-300 cursor-pointer"
					onChange={(e) => setFilterTag(e.target.value as any)}
					value={filterTag}
				>
					<option value="__all__">Усі</option>
					<option value="__untagged__">Без тегу</option>
					<option value="cant-move">Неможливо перемістити</option>
					<option value="planned">Заплановано</option>
					<option value="moved">Переміщено</option>
				</select>
			</label>
		</div>
	);
}

type SortLabelProps = {
	property: "id" | "name" | "lastSellDate" | "suggestion";
	label: string;

	className?: string;
};

function SortLabel({ label, property, className }: SortLabelProps) {
	const sortBy = useReportStore((s) => s.sortBy);
	const setSortBy = (sortBy: ReportStore["sortBy"]) =>
		useReportStore.setState({ sortBy });

	const sortOrder = useReportStore((s) => s.sortOrder);
	const setSortOrder = (sortOrder: ReportStore["sortOrder"]) =>
		useReportStore.setState({ sortOrder });

	function onClick() {
		if (sortBy !== property) {
			setSortBy(property);
			setSortOrder("asc");
		} else {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		}
	}

	return (
		<span
			className={`flex items-center gap-2 px-2 cursor-pointer select-none ${className}`}
			onClick={onClick}
		>
			{label} {sortBy !== property ? <ArrowDownUp className="size-4" /> : null}
			{sortBy === property && sortOrder === "asc" ? (
				<ArrowDown className="size-4" />
			) : null}
			{sortBy === property && sortOrder === "desc" ? (
				<ArrowUp className="size-4" />
			) : null}
		</span>
	);
}

type SuggestionTagProps = {
	suggestion: "keep" | "move-further" | "move-closer";
};

function SuggestionTag({ suggestion }: SuggestionTagProps) {
	return (
		<>
			{suggestion === "move-further" ? (
				<span className="flex gap-2 border text-xs px-2 py-1 rounded-full bg-orange-200 text-orange-700">
					<ArrowLeft className="size-4" /> На склад
				</span>
			) : null}
			{suggestion === "move-closer" ? (
				<span className="flex gap-2 border text-xs px-2 py-1 rounded-full bg-green-200 text-green-700">
					<ArrowLeft className="size-4" /> В магазин
				</span>
			) : null}
			{suggestion === "keep" ? (
				<span className="flex gap-2 border text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
					<Check className="size-4" /> Не чіпати
				</span>
			) : null}
		</>
	);
}

type EditProductDialogProps = {
	product: Omit<ProductRow, "lastSellDate">;
};

function EditProductDialog({ product }: EditProductDialogProps) {
	const [newProduct, setNewProduct] = useState({ ...product });
	const {
		trigger: updateProduct,
		isMutating,
		error,
	} = useSWRMutation(["update-product", product.id], () =>
		// new Promise((r) => setTimeout(() => r(1), 1000)),
		fetcher<{ "odata.error": any } | { "odata.metadata": string }>({
			method: "PATCH",
			url: `/shop/odata/standard.odata/Catalog_Номенклатура(guid'${product.ref}')?$format=json`,
			body: {
				МестоХранения_Key: newProduct.place1,
				МестоХранения1_Key: newProduct.place2,
				МестоХранения2_Key: newProduct.place3,
			},
		}).then((r) => {
			if ("odata.error" in r) {
				throw new Error("Something went wrong...");
			}
		}),
	);
	function clearPlace(place: "place1" | "place2" | "place3") {
		if (confirm(`Дійсно очистити ${place}`)) {
			setNewProduct((p) => ({ ...p, [place]: null }));
		}
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger className="size-10 bg-gray-50 border rounded-lg flex items-center justify-center">
				<Pencil className="size-4" />
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed w-11/12 lg:w-2/6 h-96 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
					<span>{newProduct.id}</span>
					<Dialog.Title className="font-semibold mb-4">
						{newProduct.name}
					</Dialog.Title>
					<div className="flex flex-col grow gap-2">
						<div className="flex text-lg gap-3 items-center">
							<span>Місце 1:</span>
							<PlaceSelectorDialog
								title="Місце 1"
								setPlace={(place) =>
									setNewProduct((p) => ({ ...p, place1: place }))
								}
								place={newProduct.place1}
							/>
							<button onClick={() => clearPlace("place1")}>
								<X className="size-5" />
							</button>
						</div>
						<div className="flex text-lg gap-3 items-center">
							<span>Місце 2:</span>
							<PlaceSelectorDialog
								title="Місце 2"
								setPlace={(place) =>
									setNewProduct((p) => ({ ...p, place2: place }))
								}
								place={newProduct.place2}
							/>
							<button onClick={() => clearPlace("place2")}>
								<X className="size-5" />
							</button>
						</div>
						<div className="flex text-lg gap-3 items-center">
							<span>Місце 3:</span>
							<PlaceSelectorDialog
								title="Місце 3"
								setPlace={(place) =>
									setNewProduct((p) => ({ ...p, place3: place }))
								}
								place={newProduct.place3}
							/>
							<button onClick={() => clearPlace("place3")}>
								<X className="size-5" />
							</button>
						</div>
					</div>
					<div className="h-10 text-red-600">{error && "Помилка"}</div>
					<div>
						<button
							onClick={() => updateProduct()}
							disabled={isMutating}
							className="bg-green-500 active:bg-green-600 disabled:opacity-80 w-full rounded-lg py-3 font-semibold flex items-center justify-center duration-150"
						>
							<Spinner
								size={24}
								className={
									isMutating ? "" : "opacity-0 size-0 absolute duration-150"
								}
							/>
							<span
								className={
									isMutating ? "opacity-0 size-0 absolute" : "duration-150"
								}
							>
								Зберегти
							</span>
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

type PlaceSelectorDialogProps = {
	title: string;
	setPlace: (placeRef: string) => void;
	place: string | null;
};

type StorageCell = {
	Ref_Key: string;
	Description: string;
	Code: string;
	IsFolder: boolean;
	Parent_Key: string;
};

function PlaceSelectorDialog({
	title,
	setPlace,
	place,
}: PlaceSelectorDialogProps) {
	const { data: places, isLoading: isLoadingPlaces } = useSWR("places", () =>
		fetcher<{ value?: StorageCell[] }>({
			method: "GET",
			url: "/shop/odata/standard.odata/Catalog_СкладскиеЯчейки?$format=json&$filter=DeletionMark eq false&$select=Ref_Key,Parent_Key,Description,Code,IsFolder",
		}).then((r) => r.value),
	);
	const [path, setPath] = useState<string[]>([EMPTY_REF]);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState<{
		Ref_Key: string;
		Code: string;
	} | null>(null);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger className="flex items-center grow">
				<span className="grow text-start">
					{selectedPlace
						? places?.find((place) => place.Ref_Key === selectedPlace.Ref_Key)
								?.Code
						: place}
				</span>
				<div className="size-10 bg-gray-50 border rounded-lg flex items-center justify-center">
					<Pencil className="size-4" />
				</div>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed z-10 inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed z-10 w-11/12 lg:w-2/6 h-4/5 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
					<Dialog.Title className="font-semibold mb-4">{title}</Dialog.Title>
					<div className="h-8">
						{path.length > 1 ? (
							<button
								className="flex"
								disabled={path.length === 1}
								onClick={() => setPath((p) => p.slice(1))}
							>
								<ChevronLeft className="size-5" /> Назад
							</button>
						) : null}
					</div>

					<div className="flex flex-col overflow-y-auto min-h-0 grow py-2">
						{isLoadingPlaces && "Loading..."}

						{places
							?.filter((el) => el.Parent_Key === path[0])
							.map((item) => (
								<button
									key={item.Ref_Key + title}
									className={`flex items-center gap-1 border-b py-2 px-2 ${selectedPlace?.Ref_Key === item.Ref_Key ? "bg-gray-100" : ""}`}
									onClick={() => {
										if (item.IsFolder) {
											setPath((p) => [item.Ref_Key, ...p]);
											setSelectedPlace(null);
											return;
										}
										setSelectedPlace(item);
									}}
								>
									{item.IsFolder ? (
										<Folder className="size-4 text-gray-600" />
									) : null}
									{item.Code}
								</button>
							))}
					</div>
					<div className="flex gap-3">
						<button
							className="bg-gray-200 active:bg-gray-300 w-full rounded-lg py-3 font-semibold"
							onClick={() => {
								setPath([EMPTY_REF]);
								setSelectedPlace(null);
								setIsOpen(false);
							}}
						>
							Скасувати
						</button>

						<button
							className="bg-green-500 active:bg-green-600 disabled:opacity-25 disabled:active:bg-green-500 text-slate-700 w-full rounded-lg py-3 font-semibold "
							disabled={!selectedPlace}
							onClick={() => {
								if (!selectedPlace) {
									return;
								}
								setPlace(selectedPlace.Ref_Key);
								setPath([""]);
								setIsOpen(false);
							}}
						>
							Обрати
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

type TagSelectorDialogProps = {
	product_ref: string;
};

function TagSelectorDialog({ product_ref }: TagSelectorDialogProps) {
	const tags = useReportStore((s) => s.productTags[product_ref]);
	const toggleProductTag = useReportStore((s) => s.toggleProductTag);

	return (
		<Dialog.Root>
			<Dialog.Trigger className="flex items-center grow">
				<div className="size-10 bg-gray-50 border rounded-lg flex items-center justify-center">
					<Tags className="size-4" />
				</div>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed z-10 inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed z-10 w-11/12 lg:w-2/6 h-96 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
					<Dialog.Title className="font-semibold mb-4">Теги</Dialog.Title>
					{allTags.map(({ tag, label }) => (
						<label key={tag}>
							<input
								type="checkbox"
								onChange={() => toggleProductTag(product_ref, tag)}
								checked={tags?.includes(tag) ?? false}
							/>
							{label}
						</label>
					))}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
