import { House } from "lucide-react";
import { Link } from "wouter";

export default function ReportsPage() {
	return (
		<main className="flex gap-2 p-3">
			<Link to="/" className="flex gap-1">
				<House /> головна
			</Link>
			<Link to="/report/leftovers" className="">
				Залишки по постачальнику
			</Link>
			<Link to="/report/place-change-suggestions" className="">
				Поради переміщення товару
			</Link>
		</main>
	);
}
