import {
	Dispatch,
	FormEvent,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Eraser, X } from "lucide-react";

type CMDKProps = {
	search: string;
	onChangeSearch: Dispatch<SetStateAction<string>>;
	isOpen: boolean;
	onChangeOpen: Dispatch<SetStateAction<boolean>>;
	items?: { id: string; name: string; onClick?: () => void }[];
	onFormSubmit?: () => void;
	closeOnSelect?: boolean;
	title?: string;
	isLoading?: boolean;
};

export function CMDK({
	search,
	onChangeSearch,
	items = [],
	isOpen,
	onChangeOpen,
	onFormSubmit,
	closeOnSelect,
	title,
	isLoading,
}: CMDKProps) {
	const [focusedItem, setFocusedItem] = useState(0);
	// щоб нормально достукуватися в обробнику натискань
	const focusedItemRef = useRef(focusedItem);

	const itemsBlockRef = useRef<HTMLDivElement>(null);

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		if (onFormSubmit) {
			onFormSubmit();
		}
		const focused = items[focusedItem];
		if (focused.onClick) {
			focused.onClick();
			if (closeOnSelect) {
				onChangeOpen(false);
			}
		}
	}

	function arrowListener(event: KeyboardEvent) {
		if (event.key === "ArrowDown") {
			focusedItemRef.current = focusedItemRef.current + 1;
			setFocusedItem((c) => c + 1);
		}
		if (event.key === "ArrowUp") {
			if (focusedItemRef.current !== 0) {
				focusedItemRef.current = focusedItemRef.current - 1;
				setFocusedItem((c) => c - 1);
			}
		}
		if (focusedItemRef.current >= 3 && itemsBlockRef.current) {
			// завжди тримаємо сфокусований по центру
			itemsBlockRef.current.scrollTo({
				top: (focusedItemRef.current - 3) * 44,
				behavior: "smooth",
			});
		}
	}

	useEffect(() => {
		window.addEventListener("keydown", arrowListener);
		return () => window.removeEventListener("keydown", arrowListener);
	}, []);

	return (
		<>
			<Dialog.Root open={isOpen} onOpenChange={onChangeOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed z-50 inset-0 bg-black bg-opacity-30" />
					<Dialog.Content className="fixed z-50 w-11/12 md:w-4/6 bg-white shadow-lg top-3 md:top-1/2 start-1/2 -translate-x-1/2 md:-translate-y-1/2 rounded-lg">
						<Dialog.Title className="sr-only">{title}</Dialog.Title>
						<form
							className="border-b-2 flex items-center pe-2"
							onSubmit={onSubmit}
						>
							<input
								className="w-full outline-none px-3 py-3 font-bold text-2xl duration-150 rounded-xl"
								placeholder="Пошук..."
								onChange={(e) => onChangeSearch(e.target.value)}
								value={search}
							/>

							<button
								type="button"
								disabled={!search.length}
								className="p-2 rounded-lg hover:bg-black hover:bg-opacity-10 disabled:opacity-15"
								onClick={() => onChangeSearch("")}
							>
								<Eraser />
							</button>
							<button
								type="button"
								className="p-2 rounded-lg hover:bg-black hover:bg-opacity-10"
								onClick={() => onChangeOpen(false)}
							>
								<X />
							</button>
						</form>
						<div className="px-3 py-2 h-80 overflow-y-auto" ref={itemsBlockRef}>
							{!items.length && !isLoading ? (
								<div className="h-full flex items-center justify-center text-2xl">
									Почни шукати
								</div>
							) : null}
							{isLoading ? (
								<div className="h-full flex items-center justify-center text-2xl">
									Зачекай....
								</div>
							) : null}
							{items.map((item, index) => (
								<button
									onClick={() => {
										item.onClick ? item.onClick() : null;
										closeOnSelect ? onChangeOpen(false) : null;
									}}
									key={item.id}
									className={`text-xl text-start w-full px-2 py-2 hover:bg-black hover:bg-opacity-10 rounded ${focusedItem === index ? "bg-black !bg-opacity-20" : ""}`}
								>
									{item.name}
								</button>
							))}
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
