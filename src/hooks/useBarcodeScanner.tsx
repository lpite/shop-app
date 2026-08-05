import { useEffect, useRef } from "react";

type UseBarcodeScanner = {
	onScanEnd?: (code: string) => void;
	onScanStart?: () => void;
	timeout?: number;
};

export function useBarcodeScanner({
	onScanEnd,
	onScanStart,
	timeout = 65,
}: UseBarcodeScanner) {
	const bufferRef = useRef("");

	const lastKeyTimeRef = useRef(Date.now());

	const onScanEndRef = useRef(onScanEnd);
	const onScanStartRef = useRef(onScanStart);

	useEffect(() => {
		onScanEndRef.current = onScanEnd;
	}, [onScanEnd]);

	useEffect(() => {
		onScanStartRef.current = onScanStart;
	}, [onScanStart]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			const targetTag = target.tagName.toUpperCase();

			if (
				target instanceof HTMLElement &&
				["INPUT", "TEXTAREA", "SELECT"].includes(targetTag)
			) {
				return;
			}

			const currentTime = Date.now();
			const timeDiff = currentTime - lastKeyTimeRef.current;

			if (timeDiff > timeout) {
				bufferRef.current = "";
			}

			if (event.key === "Enter") {
				if (bufferRef.current.length > 0) {
					if (onScanEndRef.current) {
						onScanEndRef.current(bufferRef.current);
					}
					bufferRef.current = "";
				}
			} else if (event.key.length === 1) {
				if (!bufferRef.current.length && onScanStartRef.current) {
					onScanStartRef.current();
				}
				bufferRef.current += event.key;
			}

			lastKeyTimeRef.current = currentTime;
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [timeout]);
}
