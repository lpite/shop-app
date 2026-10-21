type SmallPriceTagProps = {
	name: string;
	searchCode: string;
};

export function SmallPriceTag({ name, searchCode }: SmallPriceTagProps) {
	return (
		<div
			className="text-center border-2 border-black flex items-center justify-center flex-col break-inside-avoid"
			style={{ width: "193.5px", height: "86px" }}
		>
			<p className="m-0 leading-tight font-bold">{name}</p>
			<p className="m-0">
				Код <b className="text-lg">{searchCode}</b>
			</p>
		</div>
	);
}
