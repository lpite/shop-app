export function getShortcutsLayer() {
	const isPopupOpen = Boolean(
		document.querySelector("[data-radix-focus-guard]"),
	);

	if (isPopupOpen) {
		return "popup";
	}
	return "page";
}
