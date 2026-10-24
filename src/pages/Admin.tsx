import { ArrowRightLeft, House, Package, Printer, Tag } from "lucide-react";
import { Link } from "wouter";

const items = [
	{
		to: "/",
		icon: House,
		title: "Головна",
		accent: "bg-slate-100 text-slate-700",
	},
	{
		to: "/report/leftovers",
		icon: Package,
		title: "Залишки по постачальнику",
		accent: "bg-amber-100 text-amber-700",
	},
	{
		to: "/report/place-change-suggestions",
		icon: ArrowRightLeft,
		title: "Поради переміщення товару",
		accent: "bg-violet-100 text-violet-700",
	},
	{
		to: "/",
		icon: Printer,
		title: "Друк",
		accent: "bg-emerald-100 text-emerald-700",
	},
	{
		to: "/price-tags",
		icon: Tag,
		title: "Цінники",
		accent: "bg-sky-100 text-sky-700",
	},
];

export default function AdminPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6 sm:px-6">
			<nav className="flex flex-wrap gap-2">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.title}
							to={item.to}
							className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
						>
							<div
								className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.accent}`}
							>
								<Icon className="size-4" />
							</div>
							<span className="font-medium text-slate-800">{item.title}</span>
						</Link>
					);
				})}
			</nav>
		</main>
	);
}
