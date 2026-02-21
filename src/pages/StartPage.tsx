import { Settings, Sticker } from "lucide-react";
import { Link } from "wouter";

export default function StartPage() {
	return (
		<main className="flex items-center justify-center w-full h-full gap-4">
			<span className="fixed top-3 start-3">{__BUILD_ID__}</span>
			<div className="fixed end-3 top-3 flex gap-3">
				<Link to="/report" className="p-2 hover:bg-slate-100 rounded-lg">
					<Sticker />
				</Link>
				<Link to="/config" className="p-2 hover:bg-slate-100 rounded-lg">
					<Settings />
				</Link>
			</div>
			<Link
				to="/clients"
				className="w-32 py-3 bg-sky-600 rounded-lg text-center text-white font-semibold"
			>
				Продаж
			</Link>
			{/*<Link to="/pos/УТ-00000002/return" className="w-32 py-3 bg-sky-600 rounded-lg text-center text-white font-semibold">Повернення</Link>*/}
			<a
				href="/document.php?partnerId=УТ-00000002&type=return"
				className="w-32 py-3 bg-sky-600 rounded-lg text-center text-white font-semibold"
			>
				Повернення
			</a>
		</main>
	);
}
