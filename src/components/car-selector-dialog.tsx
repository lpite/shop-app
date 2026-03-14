import * as Dialog from "@radix-ui/react-dialog";
import { Car, ChevronLeft } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import useSWR from "swr";
import { useConfig } from "../stores/configStore";

type State = {
	brand: { id: string; name: string } | null;
	model: { id: string; name: string } | null;
	engine: { id: string; name: string } | null;
	category: { id: string; name: string } | null;
};

export function CarSelectorDialog() {
	const { pb_base_url } = useConfig();

	const [state, setState] = useState<State>({
		brand: null,
		model: null,
		engine: null,
		category: null,
	});

	const [filterQuery, setFilterQuery] = useState<string | null>(null);

	const { data: categories } = useSWR(
		"car_category_tree",
		() =>
			fetch(`${pb_base_url}/api/collections/car_category_tree/records`)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<
				{ id: string; name: string; parent: string }[]
			>,
	);

	const { data: brands } = useSWR(
		"car_brand",
		() =>
			fetch(`${pb_base_url}/api/collections/car_brand/records?perPage=1000`)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<{ id: string; name: string }[]>,
	);

	const { data: models } = useSWR(
		state.brand ? ["models", state.brand.id] : null,
		() =>
			fetch(
				`${pb_base_url}/api/collections/car_model/records?filter=brand='${state.brand?.id}'&perPage=1000`,
			)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<{ id: string; name: string }[]>,
	);
	const { data: engines } = useSWR(
		state.brand && state.model
			? ["engines", state.brand.id, state.model.id]
			: null,
		() =>
			fetch(
				`${pb_base_url}/api/collections/car_engine/records?filter=model='${state.model?.id}'&perPage=1000`,
			)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<
				{
					id: string;
					name: string;
					code: string;
					cc: number;
					hp: number;
					kw: number;
					production_from: string;
					production_to: string;
				}[]
			>,
	);

	const { data: parts } = useSWR(
		state.brand && state.model && state.engine
			? ["parts", state.brand.id, state.model.id, state.engine.id]
			: null,
		() =>
			fetch(
				`${pb_base_url}/api/collections/car_part/records?filter=engine='${state.engine?.id}'&perPage=1000`,
			)
				.then((r) => r.json())
				.then((r) => r.items) as Promise<
				{
					id: string;
					category: string;
					oem: string;
					article: string;
					brand: string;
				}[]
			>,
	);

	function goBack() {
		if (state.category) {
			setState({ ...state, category: null, engine: null });
			return;
		}
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
												<span>{engine.name}</span>
												<span>{engine.code}</span>
											</span>
											<span className="flex gap-2 text-gray-600">
												<span>
													<span>cc: </span>
													{engine.cc}
												</span>
												<span>hp: {engine.hp}</span>
												<span>kw: {engine.kw}</span>
												<span className="grow text-right">
													{engine.production_from} - {engine.production_to}
												</span>
											</span>
										</button>
									))}
								{state.brand &&
									state.model &&
									state.engine &&
									categories
										?.filter((cat) => !cat.parent.length)
										.map((category, i, arr) => {
											return (
												<Category
													key={category.id}
													categories={categories}
													category={category}
													parts={parts}
													setState={setState}
													state={state}
												/>
											);
										})}
							</div>
						</div>
						<div className="flex flex-col border rounded-lg p-2 grow">
							<span className="text-xl">Запчастини</span>
							<div className="min-h-0 overflow-y-auto">
								{state.brand &&
									state.model &&
									state.engine &&
									state.category &&
									parts
										?.filter((el) => el.category === state.category?.id)
										.map((part) => {
											return (
												<div key={part.id} className="m-2 border p-2 flex">
													{part.brand === "sum32lgz6lk47or" ? (
														<img
															src={`https://s7g10.scene7.com/is/image/mannhummel/${part.article}?qlt=82`}
															className="h-24 w-24 object-contain"
														/>
													) : null}
													{part.article}
													{part.oem}
												</div>
											);
										})}
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
