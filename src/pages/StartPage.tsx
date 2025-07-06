import { Link } from "wouter";

export default function StartPage() {
	return (
		<main className="flex items-center justify-center w-full h-full gap-4">
			<span className="fixed top-3 start-3">{__BUILD_ID__}</span>
			<Link
				to="/clients"
				className="w-32 py-3 bg-sky-600 rounded-lg text-center text-white font-semibold"
			>
				Продаж
			</Link>
			{/*<Link to="/document/УТ-00000002/return" className="w-32 py-3 bg-sky-600 rounded-lg text-center text-white font-semibold">Повернення</Link>*/}
			<a
				href="/document.php?partnerId=УТ-00000002&type=return"
				className="w-32 py-3 bg-sky-600 rounded-lg text-center text-white font-semibold"
			>
				Повернення
			</a>
		</main>
	);
}
