interface SpinnerProps {
	size: number;
}

export function Spinner({ size = 20 }: SpinnerProps) {
	return (
		<div
			className={`border-2 border-sky-600 rounded-full border-t-transparent animate-spin h-${size} w-${size}`}
		></div>
	);
}
