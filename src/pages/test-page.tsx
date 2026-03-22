import useSWR from "swr";
import { catalog } from "../api/catalog";
import { Dispatch, SetStateAction, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useConfig } from "../stores/config-store";
import { Car, ChevronLeft } from "lucide-react";

export function TestPage() {
	return (
		<main className="flex">
			<CarSelectorDialog />
		</main>
	);
}

export function CarSelectorDialog() {
	const { pb_base_url } = useConfig();

	const [state, setState] = useState<State>({
		brand: null,
		model: null,
		engine: null,
	});

	const [filterQuery, setFilterQuery] = useState<string | null>(null);

	const { data: brands } = useSWR("car_brand", catalog.getCarBrands);

	const { data: models } = useSWR(
		state.brand ? ["models", state.brand.id] : null,
		() => catalog.getCarModels(state.brand?.id || 0),
	);
	const { data: engines } = useSWR(
		state.brand && state.model
			? ["engines", state.brand.id, state.model.id]
			: null,
		() => catalog.getCarEngines(state.model?.id || 0),
	);

	const { data } = useSWR(
		state.brand && state.model && state.engine ? "shit" : null,
		() =>
			fetch(
				`http://localhost:8090/api/collections/wix_temp/records?filter=${state.engine?.codes.map((el) => `eng_code~'${el}'`).join(" || ")}`,
			).then((r) => r.json()),
	);

	console.log(data);

	function goBack() {
		if (state.engine) {
			setState({ ...state, engine: null });
			return;
		}
		if (state.model) {
			setState({ ...state, model: null });
			return;
		}
		if (state.brand) {
			setState({ ...state, brand: null });
			return;
		}
	}
	function getSectionName() {
		if (state.brand) {
			return "Моделі";
		}
		if (state.model) {
			return "Двигуни";
		}
		if (state.engine) {
			return "Категорії";
		}

		return "Бренди";
	}

	async function linkPartToCar(el: any) {
		if (!state.engine?.id) {
			return;
		}
		const wixSupplierId = "n05rgt1fe61epx4";
		const filters = el.filters as string[];
		for (const filter of filters) {
			let filterId = await fetch(
				`http://localhost:8090/api/collections/catalog_article/records?filter=article='${filter}'`,
			)
				.then((r) => r.json())
				.then((r) => r.items[0].id)
				.catch(() => null);
			if (!filterId) {
				filterId = await fetch(
					"http://localhost:8090/api/collections/catalog_article/records",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							article: filter,
							supplier_id: wixSupplierId,
						}),
					},
				)
					.then((r) => r.json())
					.then((r) => r.id);
			}
			await fetch(
				"http://localhost:8090/api/collections/catalog_article_engine_link/records",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						article_id: filterId,
						engine_id: state.engine.id,
					}),
				},
			);
		}
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger className="size-10 border-2 rounded-lg flex items-center justify-center hover:bg-gray-200">
				<Car className="size-5" />
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed w-5/6 h-3/4 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
					<Dialog.Title className="text-2xl pb-3 font-medium">
						Каталог
					</Dialog.Title>
					<div className="flex grow min-h-0 gap-2">
						<div className="w-96 h-full min-h-0 flex flex-col border rounded-lg p-2">
							<div className="flex flex-col gap-3">
								<span className="text-xl">{getSectionName()}</span>
								<button
									onClick={goBack}
									disabled={!state.brand}
									className="flex gap-2 hover:bg-gray-200 disabled:hover:bg-white disabled:opacity-15 py-2"
								>
									<ChevronLeft />
									Назад
								</button>
							</div>
							<form className="my-2" onSubmit={(e) => e.preventDefault()}>
								<input
									className="border-2 w-full p-2 rounded-lg disabled:opacity-15"
									placeholder="Пошук"
									onChange={(e) => setFilterQuery(e.target.value)}
									value={filterQuery || ""}
									disabled={state.engine !== null}
								/>
							</form>
							<div className="overflow-y-auto grow flex flex-col">
								{!state.brand &&
									brands
										?.filter((brand) => {
											if (!filterQuery) {
												return true;
											}
											if (
												brand.name
													.toLowerCase()
													.includes(filterQuery.toLowerCase())
											) {
												return true;
											}
											return false;
										})
										.map((brand) => (
											<button
												key={brand.id}
												onClick={() => {
													setState({ ...state, brand: brand });
													setFilterQuery(null);
												}}
												className="p-2 text-left border-b hover:bg-gray-200"
											>
												{brand.name}
											</button>
										))}
								{state.brand &&
									!state.model &&
									models
										?.filter((model) => {
											if (!filterQuery) {
												return true;
											}
											if (
												model.name
													.toLowerCase()
													.includes(filterQuery.toLowerCase())
											) {
												return true;
											}
											return false;
										})
										.map((model) => (
											<button
												key={model.id}
												onClick={() => {
													setState({ ...state, model: model });
													setFilterQuery(null);
												}}
												className="p-2 text-left border-b hover:bg-gray-200"
											>
												{model.name}
											</button>
										))}
								{state.brand &&
									state.model &&
									!state.engine &&
									engines?.map((engine) => (
										<button
											key={engine.id}
											onClick={() => {
												setState({ ...state, engine: engine });
												setFilterQuery(null);
											}}
											className="p-2 text-left border-b hover:bg-gray-200 flex flex-col"
										>
											<span className="flex gap-2">
												<span className="grow">{engine.name}</span>
												<span>{engine.codes.join(", ")}</span>
											</span>
											<span className="flex gap-2 text-gray-600">
												<span className="grow text-right">
													{new Date(engine.dateFrom).toLocaleDateString()} -{" "}
													{new Date(engine.dateTo).toLocaleDateString()}
												</span>
											</span>
										</button>
									))}
							</div>
						</div>
						<div className="flex flex-col border rounded-lg p-2 grow">
							<span className="text-xl">
								{state.brand?.name} {state.model?.name} {state.engine?.name}{" "}
								{state.engine?.codes.join(", ")}
							</span>
							<div className="min-h-0 overflow-y-auto flex flex-col">
								{state.brand && state.model ? (
									<>
										{data?.items?.map((el) => (
											<button
												onClick={() => linkPartToCar(el)}
												className="border-2 p-2"
											>
												{el.id} {el.make} {el.model} {el.eng_code}{" "}
												{el.filters.join(", ")}
											</button>
										))}
									</>
								) : null}
							</div>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

type CategoryProps = {
	category: {
		id: string;
		parent: string;
		name: string;
	};
	categories: {
		id: string;
		parent: string;
		name: string;
	}[];
	parts?: { id: string; category: string }[];
	setState: Dispatch<SetStateAction<State>>;
	state: State;
};

type State = {
	brand: { id: number; name: string } | null;
	model: { id: number; name: string } | null;
	engine: { id: number; name: string; codes: string[] } | null;
};

export function Category({
	category,
	categories,
	parts,
	setState,
	state,
}: CategoryProps) {
	const children = categories.filter((cat) => cat.parent === category.id);
	const partsCount =
		children.reduce((acc, cat) => {
			return (
				acc + (parts?.filter((part) => part.category === cat.id).length || 0)
			);
		}, 0) || parts?.filter((part) => part.category === category.id).length;
	const [open, setOpen] = useState(false);

	function onClick() {
		if (children.length) {
			setOpen(!open);
			return;
		}
		setState((p) => ({ ...p, category }));
	}

	return (
		<div className="">
			<button
				onClick={onClick}
				className={`p-2 border-b hover:bg-gray-200 w-full text-left ${state.category?.id === category.id ? "bg-gray-300" : ""}`}
			>
				{category.name} ({partsCount})
			</button>
			<div className="pl-8">
				{open &&
					children.map((child) => (
						<Category
							categories={categories}
							category={child}
							parts={parts}
							setState={setState}
							state={state}
						/>
					))}
			</div>
		</div>
	);
}
