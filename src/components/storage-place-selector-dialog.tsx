import { useEffect, useRef, useState } from "react";
import { ChevronLeft, CircleOff, Folder, Pencil } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

import { StorageCell, useStorageCells } from "../api/storage-cell";

const EMPTY_REF = "00000000-0000-0000-0000-000000000000";

type StoragePlaceSelectorDialogProps = {
	title: string;
	setPlace: (placeRef: string) => void;
	place: string | null;
};

export function StoragePlaceSelectorDialog({
	title,
	setPlace,
	place,
}: StoragePlaceSelectorDialogProps) {
	const { data: places, isLoading: isLoadingPlaces } = useStorageCells();

	const [lastPlaces, setLastPlaces] = useState<string[]>([]);
	const [path, setPath] = useState<string[]>([EMPTY_REF]);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState<{
		ref: string;
		id: string;
	} | null>(null);

	const fileListRef = useRef<HTMLDivElement>(null);

	function onItemClick(item: StorageCell) {
		if (item.isFolder) {
			setPath((p) => [item.ref, ...p]);
			setSelectedPlace(null);
			return;
		}
		setSelectedPlace(item);
		setLastPlaces((pr) => [item.ref, ...pr].slice(0, 3));
	}

	useEffect(() => {
		fileListRef.current?.scrollTo({
			top: 0,
		});
	}, [path]);

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger className="flex items-center grow">
				<span className="grow text-start">
					{selectedPlace
						? places?.find((place) => place.ref === selectedPlace.ref)?.id
						: places?.find((p) => p.ref === place)?.id}
				</span>
				<div className="size-10 bg-gray-50 border rounded-lg flex items-center justify-center">
					<Pencil className="size-4" />
				</div>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed z-10 inset-0 bg-black bg-opacity-25" />
				<Dialog.Content className="fixed z-10 w-11/12 lg:w-2/6 h-4/5 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col">
					<Dialog.Title className="font-semibold mb-4">{title}</Dialog.Title>
					<div className="h-8">
						{path.length > 1 ? (
							<button
								className="flex"
								disabled={path.length === 1}
								onClick={() => setPath((p) => p.slice(1))}
							>
								<ChevronLeft className="size-5" /> Назад
							</button>
						) : null}
					</div>

					<div
						ref={fileListRef}
						className="flex flex-col overflow-y-auto min-h-0 grow py-2"
					>
						{isLoadingPlaces && "Loading..."}
						{path[0] === EMPTY_REF ? (
							<>
								<span>Останні місця</span>
								{places
									?.filter((el) => lastPlaces.includes(el.ref))
									.map((item) => (
										<button
											key={item.ref + title}
											className={`flex items-center gap-1 border-b py-2 px-2 ${selectedPlace?.ref === item.ref ? "bg-gray-100" : ""}`}
											onClick={() => onItemClick(item)}
										>
											{item.isFolder ? (
												<Folder className="size-4 text-gray-600" />
											) : null}
											{item.DeletionMark ? (
												<CircleOff className="size-4 text-red-600" />
											) : null}
											{item.id}
										</button>
									))}
								<hr className="my-3" />
							</>
						) : null}
						{places
							?.filter((el) => el.parentRef === path[0])
							.map((item) => (
								<button
									key={item.ref + title}
									className={`flex items-center gap-1 border-b py-2 px-2 ${selectedPlace?.ref === item.ref ? "bg-gray-100" : ""}`}
									onClick={() => onItemClick(item)}
								>
									{item.isFolder ? (
										<Folder className="size-4 text-gray-600" />
									) : null}
									{item.DeletionMark ? (
										<CircleOff className="size-4 text-red-600" />
									) : null}
									{item.id}
								</button>
							))}
					</div>
					<div className="flex gap-3">
						<button
							className="bg-gray-200 active:bg-gray-300 w-full rounded-lg py-3 font-semibold"
							onClick={() => {
								setPath([EMPTY_REF]);
								setSelectedPlace(null);
								setIsOpen(false);
							}}
						>
							Скасувати
						</button>

						<button
							className="bg-green-500 active:bg-green-600 disabled:opacity-25 disabled:active:bg-green-500 text-slate-700 w-full rounded-lg py-3 font-semibold"
							disabled={!selectedPlace}
							onClick={() => {
								if (!selectedPlace) {
									return;
								}
								setPlace(selectedPlace.ref);
								setPath([""]);
								setIsOpen(false);
							}}
						>
							Обрати
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
