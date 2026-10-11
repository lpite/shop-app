import { Link } from "wouter";

export default function NotFound() {
	return (
		<main className="w-full h-full flex flex-col items-center justify-center gap-3">
			<h1 className="text-2xl">Сторінку не знайдено</h1>
			<Link href="/" className="text-fuchsia-700">
				Повернутися на головну
			</Link>
		</main>
	);
}
