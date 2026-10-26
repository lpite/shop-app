import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "../components/spinner";
import Show from "../utils/Show";
import { ChevronLeft, ChevronRight } from "lucide-react";

const headers = [
	"article",
	"oem",
	"name",
	"price",
	"stock",
	"minStock",
] as const;

type Headers = (typeof headers)[number];

const ROW_HEIGHT = 41;
const OVERSCAN = 10;

type Row = {
	article: string;
	oem: string;
	name: string;
	price: number;
	stock: number;
	minStock: number;
	groupId: string | null;
	id: string;
	supplierId: string | null;
	supplierId1: string | null;
};

type ProductGroup = {
	id: string;
	name: string;
};

export default function LeftoversReport() {
	const [selectedSupplier, setSelectedSupplier] = useState<
		string | undefined
	>();

	const [selectedGroup, setSelectedGroup] = useState<string>("");

	const [filters, setFilters] = useState({
		showOnlyNotInStock: false,
	});

	const [leftCollapsed, setLeftCollapsed] = useState(false);
	const [rightCollapsed, setRightCollapsed] = useState(false);
	const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(900);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const {
		data: suppliers,
		isLoading: isLoadingSuppliers,
		isValidating: isValidatingSuppliers,
	} = useSWR("/api/suppliers/", () =>
		fetcher<any[]>({
			url: "/shop/hs/api/suppliers",
			method: "GET",
		}),
	);

	const { data: productGroups } = useSWR("/api/product-groups/", () =>
		fetcher<ProductGroup[]>({
			url: "/shop/hs/api/product-groups",
			method: "GET",
		}),
	);

	const { data, isLoading } = useSWR("reports/leftovers", () =>
		fetcher<Row[]>({
			url: "/shop/hs/reports/leftovers",
			method: "GET",
		}),
	);

	const filteredData = (data ?? [])
		.map((el) => ({
			...el,
			stockDifference: el["stock"] - el["minStock"],
		}))
		.sort((a, b) => a["stockDifference"] - b["stockDifference"])
		.filter((el) => {
			if (filters.showOnlyNotInStock && el["stock"] !== 0) return false;
			if (
				selectedSupplier &&
				el.supplierId !== selectedSupplier &&
				el.supplierId1 !== selectedSupplier
			)
				return false;
			if (selectedGroup && el.groupId !== selectedGroup) return false;
			return true;
		});

	useEffect(() => {
		setScrollTop(0);
		if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
	}, [selectedSupplier, selectedGroup, filters.showOnlyNotInStock, data]);

	useEffect(() => {
		const el = scrollContainerRef.current;
		if (!el) return;
		const update = () => setViewportHeight(el.clientHeight);
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
	const endIndex = Math.min(
		filteredData.length,
		Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN,
	);
	const visibleRows = filteredData.slice(startIndex, endIndex);

	const selectedRow =
		(data ?? []).find((el) => el.id === selectedRowId) ?? null;

	return (
		<main className="flex w-screen min-h-screen gap-4 py-4 px-4">
			<aside
				className={`${leftCollapsed ? "w-12" : "w-64"} shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm h-fit sticky top-4 transition-all duration-200 overflow-hidden`}
			>
				<div
					className={`mb-3 flex items-center ${leftCollapsed ? "justify-center" : "justify-between"}`}
				>
					{!leftCollapsed && (
						<h2 className="text-lg font-semibold text-slate-800">Фільтри</h2>
					)}
					<button
						onClick={() => setLeftCollapsed((v) => !v)}
						className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
						aria-label={
							leftCollapsed ? "Розгорнути фільтри" : "Згорнути фільтри"
						}
					>
						{leftCollapsed ? (
							<ChevronRight className="size-5" />
						) : (
							<ChevronLeft className="size-5" />
						)}
					</button>
				</div>
				{!leftCollapsed && (
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<label
								htmlFor="supplier_select"
								className="text-sm font-medium text-slate-600"
							>
								Постачальник
							</label>
							<select
								className="py-2 px-3 rounded-lg border-2 bg-white disabled:bg-gray-200"
								onChange={(e) => setSelectedSupplier(e.target.value)}
								disabled={isLoadingSuppliers || isValidatingSuppliers}
								id="supplier_select"
								value={selectedSupplier ?? ""}
							>
								<option value="">Всі</option>
								{suppliers?.map((sp: any) => (
									<option key={sp["Код"]} value={sp["Код"]}>
										{sp["Наименование"]}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor="group_select"
								className="text-sm font-medium text-slate-600"
							>
								Група
							</label>
							<select
								className="py-2 px-3 rounded-lg border-2 bg-white disabled:bg-gray-200"
								onChange={(e) => setSelectedGroup(e.target.value)}
								id="group_select"
								value={selectedGroup}
							>
								<option value="">Всі</option>
								{productGroups?.map((g) => (
									<option key={g.id} value={g.id}>
										{g.name}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-2">
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={filters.showOnlyNotInStock}
									onChange={() =>
										setFilters((f) => ({
											...f,
											showOnlyNotInStock: !f.showOnlyNotInStock,
										}))
									}
								/>
								наявність 0
							</label>
						</div>

						<Show when={isLoading || isLoadingSuppliers}>
							<Spinner size={30} />
						</Show>
					</div>
				)}
			</aside>

			<section className="flex-1 min-w-0">
				<div
					ref={scrollContainerRef}
					onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
					className="max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
				>
					<table className="w-full table-fixed">
						<colgroup>
							<col className="w-36" />
							<col className="w-36" />
							<col />
							<col className="w-16" />
							<col className="w-14" />
							<col className="w-20" />
							<col className="w-20" />
						</colgroup>
						<thead className="sticky top-0 z-10 bg-white">
							<tr>
								{headers.map((k) => (
									<td className="border p-2 font-medium" key={k}>
										{k}
									</td>
								))}
								<td className="border p-2 font-medium">Різниця</td>
							</tr>
						</thead>
						<tbody>
							{startIndex > 0 && (
								<tr aria-hidden="true">
									<td
										colSpan={headers.length + 1}
										className="border-0 p-0"
										style={{ height: startIndex * ROW_HEIGHT }}
									/>
								</tr>
							)}
							{visibleRows.map((el) => (
								<Row
									headers={headers as any}
									el={el}
									key={el.id}
									isSelected={selectedRowId === el.id}
									onSelect={() =>
										setSelectedRowId((prev) => (prev === el.id ? null : el.id))
									}
								/>
							))}
							{endIndex < filteredData.length && (
								<tr aria-hidden="true">
									<td
										colSpan={headers.length + 1}
										className="border-0 p-0"
										style={{
											height: (filteredData.length - endIndex) * ROW_HEIGHT,
										}}
									/>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<div className="mt-3 flex items-center justify-between gap-3">
					<span className="text-sm text-slate-500">
						{filteredData.length > 0
							? `Показано ${startIndex + 1}–${endIndex} з ${filteredData.length}`
							: "Немає даних"}
					</span>
				</div>
			</section>
			<aside
				className={`${rightCollapsed ? "w-12" : "w-72"} shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm h-fit sticky top-4 transition-all duration-200 overflow-hidden`}
			>
				<div
					className={`mb-3 flex items-center ${rightCollapsed ? "justify-center" : "justify-between"}`}
				>
					{!rightCollapsed && (
						<h2 className="text-lg font-semibold text-slate-800">Аналітика</h2>
					)}
					<button
						onClick={() => setRightCollapsed((v) => !v)}
						className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
						aria-label={
							rightCollapsed ? "Розгорнути аналітику" : "Згорнути аналітику"
						}
					>
						{rightCollapsed ? (
							<ChevronLeft className="size-5" />
						) : (
							<ChevronRight className="size-5" />
						)}
					</button>
				</div>
				{!rightCollapsed && (
					<>
						<h2 className="mt-5 mb-3 text-lg font-semibold text-slate-800">
							Обраний товар
						</h2>
						{selectedRow ? (
							<div className="rounded-xl border border-slate-200 p-3 text-sm">
								<div className="font-semibold text-slate-800">
									{selectedRow.name}
								</div>
								<div className="mt-2 grid grid-cols-2 gap-2 text-slate-600">
									<span>Залишок: {selectedRow.stock}</span>
									<span>Мін.: {selectedRow.minStock}</span>
									<span>Ціна: {selectedRow.price}</span>
									<span>
										Різниця: {selectedRow.stock - selectedRow.minStock}
									</span>
								</div>
							</div>
						) : (
							<p className="text-sm text-slate-500">
								Оберіть рядок у таблиці, щоб переглянути деталі.
							</p>
						)}

						<h2 className="mt-5 mb-3 text-lg font-semibold text-slate-800">
							Фото
						</h2>
						<div className="grid grid-cols-2 gap-2">
							{[0, 1, 2, 3].map((i) => (
								<div
									key={i}
									className="aspect-square rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-400"
								>
									немає фото
								</div>
							))}
						</div>
					</>
				)}
			</aside>
		</main>
	);
}

function Row({
	headers,
	el,
	isSelected,
	onSelect,
}: {
	headers: Headers[];
	el: Row;
	isSelected: boolean;
	onSelect: () => void;
}) {
	return (
		<tr
			onClick={onSelect}
			className={`cursor-pointer whitespace-nowrap transition-colors ${
				isSelected ? "bg-sky-100" : "hover:bg-slate-50"
			}`}
		>
			{headers.map((k) => (
				<td className="border p-2 text-wrap" key={k + el["name"]}>
					{el[k]}
				</td>
			))}
			<td className="border p-2 truncate">{el["stock"] - el["minStock"]}</td>
		</tr>
	);
}
