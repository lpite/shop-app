interface SpinnerProps {
	size: number;
	className?: string;
}

export function Spinner({ size = 40, className = "" }: SpinnerProps) {
	return (
		<div
			className={`border-2 border-sky-600 border-solid rounded-full border-t-transparent animate-spin ${className}`}
			style={{ width: size, height: size }}
		></div>
	);
}
