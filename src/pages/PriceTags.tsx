import { FormEvent, useState } from "react";
import useSWR from "swr";
import { Eraser, Plus, Printer } from "lucide-react";
import { toast } from "sonner";

import { PriceTag } from "../components/price-tags/price-tag";
import { PriceTagRow } from "../components/price-tags/price-tag-row";
import { SmallPriceTag } from "../components/price-tags/small-price-tag";
import { PriceTagType, usePriceTagsStore } from "../stores/price-tags-store";
import { Product } from "../types/product";
import { fetcher } from "../utils/fetcher";

export default function PriceTagsPage() {
	const tags = usePriceTagsStore((state) => state.tags);
	const smallTags = usePriceTagsStore((state) => state.smallTags);
	const addTag = usePriceTagsStore((state) => state.addTag);
	const clearTags = usePriceTagsStore((state) => state.clearTags);
	const setSmallTags = usePriceTagsStore((state) => state.setSmallTags);

	const { data: products, isLoading } = useSWR(
		"app/product",
		() =>
			fetcher<Product[]>({
				url: "/shop/hs/app/product",
				method: "GET",
			}),
		{ revalidateOnFocus: false },
	);

	const [code, setCode] = useState("");
	const [tagType, setTagType] = useState<PriceTagType>("default");

	function addProduct(product: Product) {
		addTag({
			searchCode: product.searchCode,
			name: product.name,
			price: Number(product.price) || 0,
			type: tagType,
		});
		setCode("");
	}

	function findProductByCode(value: string) {
		return products?.find(
			(product) =>
				product.searchCode === value ||
				product.code === value ||
				product.code?.replace("-", "") === value,
		);
	}

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		const value = code.trim();
		if (!value) {
			return;
		}
		console.log(products);
		const product = findProductByCode(value);
		if (!product) {
			toast.error("Такого товару ще немає");
			return;
		}

		addProduct(product);
	}

	return (
		<main className="flex h-full flex-col overflow-hidden print:h-auto print:overflow-visible">
			<div className="print:hidden sticky top-0 z-10 bg-white border-b-2 p-2 flex flex-wrap items-center gap-2">
				<form className="flex items-center gap-2" onSubmit={onSubmit}>
					<input
						className="border-2 rounded-lg px-2 h-9 w-52"
						placeholder="Пошуковий код"
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>
					<select
						className="border-2 rounded-lg px-2 h-9"
						value={tagType}
						onChange={(e) => setTagType(e.target.value as PriceTagType)}
					>
						<option value="default">Стандарт</option>
						<option value="simple">Вітрина</option>
					</select>
					<button
						type="submit"
						className="border-2 rounded-lg px-3 h-9 bg-sky-600 text-white hover:bg-sky-500 flex items-center gap-1"
					>
						<Plus className="size-4" /> Додати
					</button>
				</form>
				<label className="flex items-center gap-2 h-9">
					<input
						type="checkbox"
						checked={smallTags}
						onChange={(e) => setSmallTags(e.target.checked)}
					/>
					Маленькі
				</label>
				<div className="grow" />
				<span className="text-sm text-gray-600">{tags.length} цінників</span>
				<button
					className="border-2 rounded-lg px-3 h-9 flex items-center gap-1 hover:bg-slate-100 disabled:opacity-40"
					disabled={!tags.length}
					onClick={() => {
						clearTags();
						toast.success("Цінники очищено");
					}}
				>
					<Eraser className="size-4" /> Очистити
				</button>
				<button
					className="border-2 rounded-lg px-3 h-9 bg-sky-600 text-white hover:bg-sky-500 flex items-center gap-1"
					onClick={() => window.print()}
				>
					<Printer className="size-4" /> Друк
				</button>
			</div>

			<div className="flex grow min-h-0 flex-col lg:flex-row print:h-auto print:overflow-visible">
				<section className="print:hidden w-full lg:w-1/2 xl:w-2/5 overflow-y-auto p-2 lg:border-e-2 max-h-[45vh] lg:max-h-none">
					{isLoading ? (
						<div className="h-24 flex items-center justify-center text-gray-400">
							Завантаження товарів...
						</div>
					) : null}
					{!isLoading && !tags.length ? (
						<div className="h-64 flex items-center justify-center text-gray-400 text-xl text-center px-4">
							Додай товар за пошуковим кодом
						</div>
					) : null}
					{tags.map((tag) => (
						<PriceTagRow key={tag.id} tag={tag} />
					))}
				</section>

				<section className="grow overflow-auto p-2 print:overflow-visible">
					<div
						className="grid gap-1 justify-items-start print:justify-content-center"
						style={{
							gridTemplateColumns: `repeat(${smallTags ? 4 : 3}, ${smallTags ? "193.5px" : "260px"})`,
						}}
					>
						{tags.map((tag) =>
							smallTags ? (
								<SmallPriceTag
									key={tag.id}
									name={tag.name}
									searchCode={tag.searchCode}
								/>
							) : (
								<PriceTag
									key={tag.id}
									name={tag.name}
									price={tag.price}
									searchCode={tag.searchCode}
									type={tag.type}
								/>
							),
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
