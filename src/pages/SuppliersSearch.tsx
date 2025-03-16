import { FormEvent, useEffect, useState } from "react";

export default function SuppliersSearch() {
	const [searchValue, setSearchValue] = useState("");
	const [items, seItems] = useState<
		{
			uuid: string;
			name: string;
			article: string;
			brand: string;
			default_image: string;
		}[]
	>([]);

	async function search(e: FormEvent) {
		e.preventDefault();
		const pb_hook_url = localStorage.getItem("pb_hook_url");
		const cdn_url = localStorage.getItem("cdn_url");
		if (!cdn_url) {
			alert("no 'cdn_url' in localStorage");
			return;
		}
		if (!pb_hook_url) {
			alert("no 'pb_hook_url' in localStorage");
			return;
		}
		const result = (await fetch(`${pb_hook_url}${searchValue}`)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
				return null;
			})) as {
			headers: any;
			products: {
				article: string;
				avaible: boolean;
				brand: string;
				currency_name: string;
				default_image: string;
				name: string;
				price: string;
				uuid: string;
			}[];
		};
		if (result?.products) {
			console.log(result?.products);
			seItems(result?.products);
			// setFilteredProducts(result.items);
		}
	}

	return (
		<main className="py-4 flex flex-col items-center">
			<div className="fixed top-0 bg-white w-full flex justify-center">
				<form
					className="border-2 mt-8 w-2/6 px-2 rounded-xl flex items-center"
					onSubmit={search}
				>
					<input
						className="w-full h-12 text-xl rounded-xl outline-none"
						placeholder="пошук..."
						onChange={(e) => setSearchValue(e.target.value)}
						value={searchValue}
					/>
					<button className="h-10 w-10 text-gray-600 flex items-center justify-center hover:bg-black hover:bg-opacity-20 rounded-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
						</svg>
					</button>
				</form>
			</div>

			<div className="mt-24">
				{items.map((item, i) => (
					<div
						key={item.uuid}
						className="border-2 px-4 py-2 rounded-xl mt-1 flex items-center"
					>
						<img
							src={`${localStorage.getItem("cdn_url")}${item.default_image.replace(/\\/g, "/")}`}
							width={80}
							height={80}
							className="mr-2 my-1 rounded-lg"
						/>
						<div className="">
							{item.article}
							<br />
							{item.name.replace(item.article, "").replace(item.brand, "")}{" "}
							{item.brand}
							<br />
							{/*{item.description}*/}
						</div>
					</div>
				))}
			</div>
		</main>
	);
}
