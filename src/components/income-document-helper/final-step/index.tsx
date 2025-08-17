type FinalStepProps = {
	saveDocument: () => void;
};

export function FinalStep({ saveDocument }: FinalStepProps) {
	return (
		<div className="h-full flex items-center justify-center">
			<button
				onClick={saveDocument}
				className="border px-4 py-2 rounded-lg bg-sky-200 hover:shadow-lg"
			>
				Зберегти
			</button>
		</div>
	);
}
