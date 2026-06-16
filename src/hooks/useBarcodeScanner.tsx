import { useEffect, useRef } from "react";

export function useBarcodeScanner(
	onScan: (code: string) => void,
	timeout = 40,
) {
	const bufferRef = useRef("");
	const lastKeyTimeRef = useRef(Date.now());

	const onScanRef = useRef(onScan);
	useEffect(() => {
		onScanRef.current = onScan;
	}, [onScan]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			const targetTag = target.tagName.toUpperCase();

			if (["INPUT", "TEXTAREA", "SELECT"].includes(targetTag)) {
				return;
			}

			const currentTime = Date.now();
			const timeDiff = currentTime - lastKeyTimeRef.current;

			if (timeDiff > timeout) {
				bufferRef.current = "";
			}

			if (event.key === "Enter") {
				if (bufferRef.current.length > 0) {
					onScanRef.current(bufferRef.current);
					bufferRef.current = "";
				}
			} else if (event.key.length === 1) {
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
