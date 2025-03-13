import * as Dialog from "@radix-ui/react-dialog";
import SearchIcon from "../icons/search-icon";
import { FormEvent, useState } from "react";
import { fetcher } from "../utils/fetcher";

function correctWord(str: string) {
	// yeah it will not work properly but whatever
	switch (str.split("").reverse().join("")) {
		case "1": {
			return "День";
		}
		case "2":
		case "3":
		case "4": {
			return "Дні";
		}

		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
		case "0": {
			return "Днів";
		}

		default: {
			return "??";
		}
	}
}

export default function SearchHistoryPopup() {
	const [searchValue, setSearchValue] = useState("");
	const [list, setList] = useState<
		{
			documentDate: string;
			productName: string;
			productPrice: number;
			productQuantity: number;
		}[]
	>([]);

	async function search(e: FormEvent) {
		e.preventDefault();
		const response = (await fetcher({
			url: `/shop/hs/app/last-documents/${searchValue}`,
			method: "GET",
		})) as any;
		setList(response);
		console.log(response);
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<button className="flex items-center gap-3 h-10 px-4 bg-blue-100 rounded-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
						<path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
						<path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
					</svg>
					Історія продажу
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed w-3/6 h-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
					<Dialog.Title className="text-2xl pb-3 font-medium">
						Історія продажу товару
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
					<form
						className="border-2 h-12 flex items-center rounded-lg mt-6"
						onSubmit={search}
					>
						<input
							className="outline-none px-2 h-full w-full rounded-lg"
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
						/>
						<button className="w-12 flex items-center justify-center h-full hover:bg-black hover:bg-opacity-10 rounded-md">
							<SearchIcon />
						</button>
					</form>
					<div className="h-full overflow-y-auto mt-3 py-3">
						{list.map((item, i) => {
							const days = Math.abs(
								//@ts-expect-error just ts fun
								(new Date(item.documentDate) - new Date()) /
									(1000 * 60 * 60 * 24),
							).toFixed();

							return (
								<div className="h-24 border-2 mt-1 rounded-lg p-2" key={i}>
									<div className="flex pb-2 justify-between">
										<div className="flex gap-1 items-center">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												fill="currentColor"
												viewBox="0 0 16 16"
											>
												<path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
												<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
											</svg>
											<span>{days}</span>
											<span>{correctWord(days)} тому</span>
										</div>
										<span>{new Date(item.documentDate).toLocaleString()}</span>
									</div>
									{item.productName}
									<div className="flex gap-3">
										<span className="font-medium">
											Ціна: {item.productPrice}₴
										</span>
										<span>Кількість: {item.productQuantity}</span>
									</div>
								</div>
							);
						})}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
