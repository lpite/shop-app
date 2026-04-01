import {
	Dispatch,
	FormEvent,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { createPortal } from "react-dom";

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

	return createPortal(
		<>
			<Dialog.Root open={isOpen} onOpenChange={onChangeOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
					<Dialog.Content className="fixed w-11/12 md:w-4/6 bg-white shadow-lg top-3 md:top-1/2 start-1/2 -translate-x-1/2 md:-translate-y-1/2 rounded-lg">
						<Dialog.Title className="sr-only">{title}</Dialog.Title>
						<form
							className="border-b-2 relative flex items-center"
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
								className="absolute right-2 p-2 rounded-lg hover:bg-black hover:bg-opacity-10"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
								</svg>
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
		</>,
		document.body,
	);
}
