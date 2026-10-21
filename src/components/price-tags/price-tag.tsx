import { PriceTagType } from "../../stores/price-tags-store";

type PriceTagProps = {
	name: string;
	price: number;
	searchCode: string;
	type: PriceTagType;
};

export function PriceTag({ name, price, searchCode, type }: PriceTagProps) {
	if (!name?.length) {
		return null;
	}

	const noPdv = (price / 1.2).toFixed(2);
	const pdv = (price - price / 1.2).toFixed(2);
	const [priceBeforeDot, priceAfterDot] = price.toFixed(2).split(".");
	const lines = name.split(/\n/);

	return (
		<div className="block break-inside-avoid">
			<div className="m-px border-2 border-black flex flex-col h-[156px] w-[260px]">
				{type === "default" ? (
					<div className="h-[17px] shrink-0 flex items-center justify-around text-[8pt]">
						<span>
							Код{" "}
							<b className="text-[10pt] leading-[0.8] mb-[3px] inline-block">
								{searchCode}
							</b>
						</span>
						<span>Без ПДВ {noPdv}</span>
						<span>ПДВ {pdv}</span>
					</div>
				) : null}
				<div className="flex flex-1 items-center justify-center">
					<span className="mx-[5px] text-center text-[18pt] font-bold leading-none break-words">
						{lines.map((line, index) => (
							<span key={index}>
								{line}
								{index < lines.length - 1 ? <br /> : null}
							</span>
						))}
					</span>
				</div>
				<div className="flex items-center justify-center">
					{type === "default" ? (
						<span>
							Ціна <b className="text-[27px]">{priceBeforeDot}</b> грн{" "}
							<b className="text-[27px]">{priceAfterDot}</b> коп
						</span>
					) : null}
					{type === "simple" ? (
						<span className="text-[10pt] leading-[0.8] mb-[3px]">
							Код <b className="text-[14pt]">{searchCode}</b>
						</span>
					) : null}
				</div>
			</div>
		</div>
	);
}
