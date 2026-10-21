import { Trash2 } from "lucide-react";

import {
	PriceTag,
	PriceTagType,
	usePriceTagsStore,
} from "../../stores/price-tags-store";

type PriceTagRowProps = {
	tag: PriceTag;
};

export function PriceTagRow({ tag }: PriceTagRowProps) {
	const updateTag = usePriceTagsStore((state) => state.updateTag);
	const removeTag = usePriceTagsStore((state) => state.removeTag);

	return (
		<div className="ring-1 rounded-md p-1 my-1.5 bg-white flex gap-2 items-start">
			<textarea
				className="w-full rounded-md border-0 px-2 py-1 text-sm resize-none"
				rows={2}
				value={tag.name}
				onChange={(e) => updateTag(tag.id, { name: e.target.value })}
			/>
			<div className="flex items-center gap-2 shrink-0">
				<label className="flex items-center gap-1">
					<span className="text-xs text-gray-600">Код</span>
					<input
						type="number"
						className="w-14 ring-1 rounded-md px-1 py-0.5 text-sm"
						value={tag.searchCode}
						onChange={(e) => updateTag(tag.id, { searchCode: e.target.value })}
					/>
				</label>
				<label className="flex items-center gap-1">
					<span className="text-xs text-gray-600">Ціна</span>
					<input
						type="number"
						className="w-20 ring-1 rounded-md px-1 py-0.5 text-sm"
						value={tag.price}
						onChange={(e) =>
							updateTag(tag.id, { price: Number(e.target.value) })
						}
					/>
				</label>
				<select
					className="p-1 rounded-md text-sm"
					value={tag.type}
					onChange={(e) =>
						updateTag(tag.id, { type: e.target.value as PriceTagType })
					}
				>
					<option value="default">Стандарт</option>
					<option value="simple">Вітрина</option>
				</select>
				<button
					title="Видалити"
					className="p-1.5 bg-rose-400 rounded-md text-white hover:bg-rose-500"
					onClick={() => removeTag(tag.id)}
				>
					<Trash2 className="size-4" />
				</button>
			</div>
		</div>
	);
}
