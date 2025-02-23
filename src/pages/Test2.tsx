import useData from "../hooks/useData";
import { useState } from "react";
import { useAppStore } from "../stores/useAppStore";

import * as Dialog from "@radix-ui/react-dialog";
import convertToId from "../utils/convertToId";
import { fetcher } from "../utils/fetcher";
import useSWR from "swr";
import { Link, Route } from "wouter";

function ReplaceForm({ items }: any) {
	const {
		forReplace: { replaceW, searchV, field },
		setReplace,
	} = useAppStore();

	return (
		<form>
			<div className="flex gap-2">
				<label>
					<select
						defaultValue={field}
						onChange={({ target }) => setReplace({ field: target.value })}
					>
						{Object.keys((items && items[0]) || {}).map((el) => (
							<option value={el}>{el}</option>
						))}
					</select>
				</label>

				<label>
					:
					<input
						type="text"
						className="border-2"
						value={searchV}
						onChange={({ target }) => setReplace({ searchV: target.value })}
					/>
				</label>
				<label>
					with:
					<input
						type="text"
						className="border-2"
						value={replaceW}
						onChange={({ target }) => setReplace({ replaceW: target.value })}
					/>
				</label>
			</div>
		</form>
	);
}
function SetForm({ items }: any) {
	return (
		<form>
			<div className="flex gap-2">
				<label>
					<select>
						{Object.keys((items && items[0]) || {}).map((el) => (
							<option>{el}</option>
						))}
					</select>
				</label>
			</div>
		</form>
	);
}

export default function Test2() {
	return (
		<>
			<Route path="1" component={Step1} />
			<Route path="edit" component={StepEdit} />
			<Route path="set-category" component={SetCategory} />
		</>
	);
}

function Step1() {
	const { data } = useData({
		url: "/shop/hs/app/product/",
		method: "GET",
	}) as { data: Record<string, string>[]; isLoading: boolean };
	const [searchValue, setSearchValue] = useState("");
	const { selected, toggleSelected, deselectAll } = useAppStore();

	function selectAll() {
		const filtered = data?.filter(
			(el) =>
				el.name.includes(searchValue) || el.searchCode.includes(searchValue),
		);
		if (!filtered.length) {
			alert("Немає по пошуку");
			return;
		}
		for (const p of filtered) {
			toggleSelected(p.searchCode);
		}
	}

	return (
		<main className="flex items-center justify-center flex-col">
			<Step1Dialog />
			<h1 className="text-4xl">Вибір товарів</h1>
			<form className="w-4/12 flex gap-2 pb-4">
				<input
					type="text"
					onChange={({ target }) => setSearchValue(target.value)}
					className="border-2 rounded-xl shadow-sm p-2  w-full"
				/>
				<button
					className="border-2 rounded-xl px-6 py-2 shadow-sm"
					type="button"
					onClick={selectAll}
				>
					all
				</button>
				<button
					className="border-2 rounded-xl px-6 py-2 shadow-sm"
					type="button"
					onClick={deselectAll}
				>
					deselect
				</button>
			</form>
			<div>
				Всього знайдено -
				{
					data?.filter((el) => el.name.includes(searchValue))?.slice(0, 500)
						.length
				}
			</div>
			{data
				?.filter((el) => el.name.includes(searchValue))
				?.slice(0, 500)
				.map((el) => {
					return (
						<div className="w-8/12" key={el.searchCode}>
							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={selected.includes(el.searchCode)}
									onChange={() => toggleSelected(el.searchCode)}
								/>
								{/*  <img
									className="w-12 h-12"
									src={
										"http://" +
										localStorage.getItem("ip") +
										"/api/get-photo.php?photo=" +
										encodeURIComponent(Base64.encode(el.photoPath))
									}
								/>*/}
								<span className="px-1">{el.searchCode}</span>

								<span className="px-1">{el.name}</span>
							</label>
						</div>
					);
				})}
		</main>
	);
}
function StepEdit() {
	const { data } = useData({
		url: "/shop/hs/app/product/",
		method: "GET",
	}) as { data: Record<string, string>[]; isLoading: boolean };
	const {
		selected,
		selectedAction,
		selectActionD,
		forReplace: replace,
	} = useAppStore();

	async function saveProduct(product: any) {
		fetcher({
			url: `/shop/hs/api/product/00-${convertToId(product.searchCode)}`,
			method: "PATCH",
			body: {
				...product,
			},
		});
	}

	function save() {
		if (!confirm("?")) {
			return;
		}
		data
			?.filter((el) => selected.includes(el.searchCode))
			.forEach((p) => {
				if (selectedAction === "replace") {
					const nP = { ...p };
					nP[replace.field] = nP[replace.field].replace(
						replace.searchV,
						replace.replaceW,
					);
					nP["placeStorage"] = nP["place3"];
					saveProduct(nP);
				}
			});
	}

	return (
		<main className="flex flex-col items-center">
			<h1>EDIT</h1>
			<button className="px-4 py-2 border-2" onClick={save}>
				save
			</button>
			<label>
				action:
				<select
					defaultValue={selectedAction}
					// onSelect={selectedAction}
					onChange={({ target }) => selectActionD(target.value as any)}
				>
					<option value="replace">replace</option>
					<option value="set">set</option>
				</select>
			</label>

			{selectedAction === "replace" ? <ReplaceForm items={data} /> : null}
			{selectedAction === "set" ? <SetForm items={data} /> : null}

			{data
				?.filter((el) => selected.includes(el.searchCode))
				?.slice(0, 500)
				.map((el) => (
					<div className="w-8/12" key={el.searchCode}>
						<span className="px-1">
							{selectedAction === "replace"
								? el.name.replace(replace.searchV, replace.replaceW)
								: null}
						</span>
					</div>
				))}
		</main>
	);
}

function Step1Dialog() {
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<button className="fixed top-5 end-5 bg-green-300 py-2 px-4 rounded-lg">
					Next
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed min-w-80 min-h-80 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 py-5 px-8">
					<Dialog.Title className="text-3xl pb-4">Next step?</Dialog.Title>
					<Link
						to="/test2/edit"
						className="h-full border-2 flex items-center justify-center rounded-xl py-2 px-4 shadow-sm hover:shadow-md"
					>
						Edit
					</Link>
					<Link
						to="/test2/set-category"
						className="mt-2 h-full border-2 flex items-center justify-center rounded-xl py-2 px-4 shadow-sm hover:shadow-md"
					>
						set category
					</Link>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

function SetCategory() {
	const { selected, toggleSelected, deselectAll } = useAppStore();
	const { data: products } = useSWR("/website/product", () =>
		fetcher<any[]>({ url: "/shop/hs/website/product", method: "GET" }),
	);

	const { data: categories } = useSWR("/api/category", () =>
		fetcher<any[]>({ url: "/shop/hs/api/category", method: "GET" }),
	);

	const [loadingIndex, setLodingIndex] = useState(-1);
	const [selectedCategory, setSelectedCategory] = useState("");

	async function set() {
		if (!selectedCategory.length) {
			alert("meow");
			return;
		}
		for (const p of products?.filter((el) =>
			selected.includes(el.searchCode),
		) || []) {
			// await new Promise((r) => {
			// 	setTimeout(() => r(1), 200);
			// });
			fetcher({
				url: "/shop/hs/api/product/00-" + convertToId(p.searchCode),
				method: "PATCH",
				body: {
					description: p.description,
					nameWeb: p.name,
					name: p.workName,
					categoryWebId: selectedCategory,
				},
			}).then(() => {
				setLodingIndex((i) => i + 1);
			});
		}
	}

	return (
		<main>
			<h1>Встановлювалка категорій для інету</h1>
			<select
				className="py-4 px-6 text-xl"
				onChange={(e) => setSelectedCategory(e.target.value)}
			>
				{categories?.map((c) => (
					<option value={c.id}>
						{c.parent.name} - {c.name}
					</option>
				))}
			</select>
			<button className="py-4 px-6 text-xl bg-green-300" onClick={set}>
				set category
			</button>
			{products
				?.filter((el) => selected.includes(el.searchCode))
				.map((el, i) => (
					<div className={i === loadingIndex ? "bg-green-300" : ""}>
						{el.searchCode} - {el.name} - {el.category}
					</div>
				))}
		</main>
	);
}
