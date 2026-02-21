import { Link } from "wouter";

export default function ReportsPage() {
	return (
		<main className="flex gap-2 p-3">
			<Link href="/report/leftovers" className="">
				Залишки по постачальнику
			</Link>
			<Link href="/report/place-change-suggestions" className="">
				Поради переміщення товару
			</Link>
		</main>
	);
}
