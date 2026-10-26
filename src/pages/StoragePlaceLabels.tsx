import { useMemo, useState } from "react";
import useSWR from "swr";
import QRCode from "react-qr-code";
import {
	ChevronDown,
	ChevronRight,
	Eraser,
	Folder,
	Printer,
	Search,
} from "lucide-react";

import { StoragePlace } from "../api/storage-place";

type PlaceNode = {
	place: StoragePlace;
	children: PlaceNode[];
};

function buildTree(places: StoragePlace[]): PlaceNode[] {
	const nodes = new Map<number, PlaceNode>();
	for (const place of places) {
		nodes.set(place.id, { place, children: [] });
	}

	const roots: PlaceNode[] = [];
	for (const node of nodes.values()) {
		const parent =
			node.place.parentId != null ? nodes.get(node.place.parentId) : undefined;
		if (parent && parent !== node) {
			parent.children.push(node);
		} else {
			roots.push(node);
		}
	}

	const byName = (a: PlaceNode, b: PlaceNode) =>
		a.place.name.localeCompare(b.place.name);
	roots.sort(byName);
	for (const node of nodes.values()) node.children.sort(byName);

	return roots;
}

function filterTree(nodes: PlaceNode[], query: string): PlaceNode[] {
	const q = query.trim().toLowerCase();
	if (!q) return nodes;

	const result: PlaceNode[] = [];
	for (const node of nodes) {
		if (node.place.name.toLowerCase().includes(q)) {
			result.push(node);
			continue;
		}
		const children = filterTree(node.children, query);
		if (children.length) result.push({ ...node, children });
	}
	return result;
}

function collectPlaces(nodes: PlaceNode[]): StoragePlace[] {
	const result: StoragePlace[] = [];
	for (const node of nodes) {
		if (!node.place.isFolder) result.push(node.place);
		result.push(...collectPlaces(node.children));
	}
	return result;
}

export default function StoragePlaceLabelsPage() {
	const { data: places, isLoading } = useSWR(
		"api/storage-places",
		StoragePlace.getList,
	);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<Record<number, boolean>>({});
	const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

	const tree = useMemo(
		() => buildTree((places ?? []).filter((place) => !place.deletionMark)),
		[places],
	);
	const visibleTree = useMemo(() => filterTree(tree, query), [tree, query]);

	const selectedPlaces = (places ?? []).filter(
		(place) => selected[place.id] && !place.isFolder,
	);

	function togglePlace(id: number) {
		setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
	}

	function selectVisible() {
		setSelected((prev) => {
			const next = { ...prev };
			for (const place of collectPlaces(visibleTree)) next[place.id] = true;
			return next;
		});
	}

	return (
		<main className="flex h-full flex-col overflow-hidden print:h-auto print:overflow-visible">
			<div className="print:hidden sticky top-0 z-10 bg-white border-b-2 p-2 flex flex-wrap items-center gap-2">
				<label className="flex items-center gap-2 border-2 rounded-lg px-2 h-9">
					<Search className="size-4 text-gray-500" />
					<input
						className="outline-none w-52"
						placeholder="Пошук місця"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</label>
				<button
					className="border-2 rounded-lg px-3 h-9 hover:bg-slate-100 disabled:opacity-40"
					onClick={selectVisible}
					disabled={!visibleTree.length}
				>
					Обрати всі
				</button>
				<div className="grow" />
				<span className="text-sm text-gray-600">
					{selectedPlaces.length} міток
				</span>
				<button
					className="border-2 rounded-lg px-3 h-9 flex items-center gap-1 hover:bg-slate-100 disabled:opacity-40"
					disabled={!selectedPlaces.length}
					onClick={() => setSelected({})}
				>
					<Eraser className="size-4" /> Очистити
				</button>
				<button
					className="border-2 rounded-lg px-3 h-9 bg-sky-600 text-white hover:bg-sky-500 flex items-center gap-1 disabled:opacity-40"
					disabled={!selectedPlaces.length}
					onClick={() => window.print()}
				>
					<Printer className="size-4" /> Друк
				</button>
			</div>

			<div className="flex grow min-h-0 flex-col lg:flex-row print:h-auto print:overflow-visible">
				<section className="print:hidden w-full lg:w-1/3 xl:w-1/4 overflow-y-auto p-2 lg:border-e-2 max-h-[45vh] lg:max-h-none">
					{isLoading ? (
						<div className="h-24 flex items-center justify-center text-gray-400">
							Завантаження місць...
						</div>
					) : null}
					{!isLoading && !visibleTree.length ? (
						<div className="h-32 flex items-center justify-center text-gray-400 text-center px-4">
							Місць не знайдено
						</div>
					) : null}
					{visibleTree.map((node) => (
						<PlaceTreeItem
							key={node.place.id}
							node={node}
							depth={0}
							selected={selected}
							collapsed={collapsed}
							forceExpanded={!!query.trim()}
							onTogglePlace={togglePlace}
							onToggleFolder={(id) =>
								setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
							}
						/>
					))}
				</section>

				<section className="grow overflow-auto p-2 print:overflow-visible">
					{!selectedPlaces.length ? (
						<div className="print:hidden h-64 flex items-center justify-center text-gray-400 text-xl text-center px-4">
							Оберіть місця для друку міток
						</div>
					) : null}
					<div className="grid grid-cols-3 justify-items-start print:justify-content-center">
						{selectedPlaces.map((place) => (
							<StoragePlaceLabel key={place.id} place={place} />
						))}
					</div>
				</section>
			</div>
		</main>
	);
}

type PlaceTreeItemProps = {
	node: PlaceNode;
	depth: number;
	selected: Record<number, boolean>;
	collapsed: Record<number, boolean>;
	forceExpanded: boolean;
	onTogglePlace: (id: number) => void;
	onToggleFolder: (id: number) => void;
};

function PlaceTreeItem({
	node,
	depth,
	selected,
	collapsed,
	forceExpanded,
	onTogglePlace,
	onToggleFolder,
}: PlaceTreeItemProps) {
	const { place } = node;

	if (!place.isFolder) {
		return (
			<label
				className="flex items-center gap-2 border-b py-2 pr-2 cursor-pointer hover:bg-slate-50"
				style={{ paddingLeft: depth * 16 + 28 }}
			>
				<input
					type="checkbox"
					checked={!!selected[place.id]}
					onChange={() => onTogglePlace(place.id)}
				/>
				<span>{place.name}</span>
			</label>
		);
	}

	const expanded = forceExpanded || !collapsed[place.id];

	return (
		<div>
			<div
				className="flex items-center gap-1 border-b py-1 pr-2"
				style={{ paddingLeft: depth * 16 }}
			>
				<button
					className="p-1 rounded hover:bg-slate-100"
					onClick={() => onToggleFolder(place.id)}
					aria-label={expanded ? "Згорнути" : "Розгорнути"}
				>
					{expanded ? (
						<ChevronDown className="size-4" />
					) : (
						<ChevronRight className="size-4" />
					)}
				</button>
				<Folder className="size-4 text-gray-600" />
				<span className="font-medium">{place.name}</span>
			</div>
			{expanded
				? node.children.map((child) => (
						<PlaceTreeItem
							key={child.place.id}
							node={child}
							depth={depth + 1}
							selected={selected}
							collapsed={collapsed}
							forceExpanded={forceExpanded}
							onTogglePlace={onTogglePlace}
							onToggleFolder={onToggleFolder}
						/>
					))
				: null}
		</div>
	);
}

function StoragePlaceLabel({ place }: { place: StoragePlace }) {
	return (
		<div className="block break-inside-avoid w-full">
			<div className="m-px border-2 border-gray-400 flex items-center gap-3 p-1">
				<QRCode value={`0_${place.id}`} size={48} />
				<div className="flex-1 text-center">
					<div className="text-2xl font-bold leading-tight break-words">
						{place.name}
					</div>
				</div>
			</div>
		</div>
	);
}
