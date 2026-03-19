import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useSearch } from "../../hooks/useSearch";

export function CatalogDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const { setQuery } = useSearch({});

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger asChild>
				<button className="flex items-center justify-center h-10 border-2 px-3 gap-3 rounded-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
					</svg>
					Каталог
				</button>
			</Dialog.Trigger>
			<Dialog.Overlay className="fixed z-10 inset-0 bg-black bg-opacity-25" />
			<Dialog.Content className="fixed z-10 min-w-3/6 min-h-80 w-3/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
				<Dialog.Title className="text-2xl pb-3 font-medium">
					Каталог біт
				</Dialog.Title>
				<Dialog.Close asChild>
					<button className="absolute right-5 top-5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="36"
							height="36"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
						</svg>
					</button>
				</Dialog.Close>
				{[
					{
						name: "hex 6-гран (біта)",
						img: "hex.png",
						searchValue: "біта hex",
					},
					{
						name: "spline 12-гран зірка (біти та головки)",
						img: "spline.png",
						searchValue: "spline",
					},
					{
						name: "torx 6-гран зірка (біта)",
						img: "torx.png",
						searchValue: "біта torx",
					},
				].map(({ name, img, searchValue }) => (
					<button
						onClick={() => {
							setQuery(searchValue);
							setIsOpen(false);
						}}
						key={name}
						className="flex items-center gap-2 border-2 w-full p-2 my-1 rounded-xl hover:bg-black hover:bg-opacity-15"
					>
						<img className="h-20" src={`/icons/${img}`} />
						<span className="text-xl">{name}</span>
					</button>
				))}
			</Dialog.Content>
		</Dialog.Root>
	);
}
