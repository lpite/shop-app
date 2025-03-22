import { FormEvent, useState } from "react";

export default function FiltersDemo() {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<
		| {
				article: string;
				brand: string;
				application: string;
				id: string;
				type: string;
		  }
		| undefined
	>();

	const [alternatives, setAlternatives] = useState<
		{
			article: string;
			brand: string;
			application: string;
			id: string;
			type: string;
			number: string;
		}[]
	>([]);

	async function search(e: FormEvent) {
		e.preventDefault();
		if (!query.length) {
			return;
		}
		const filter = await fetch(
			`http://localhost:8090/api/collections/filter/records?filter=(article ~ '${query}')&perPage=1&skipTotal=true`,
		).then((r) => r.json());
		setFilter(filter.items[0]);
		if (!filter.items[0]) {
			return;
		}
		const oeNumbers = (await fetch(
			`http://localhost:8090/api/collections/test/records?fields=number&filter=(article = '${filter.items[0].article}')`,
		).then((r) => r.json())) as { items: { number: string }[] };
		if (!oeNumbers.items) {
			return;
		}
		const alternatives = await fetch(
			`http://localhost:8090/api/collections/test/records?filter=
			(${oeNumbers.items
				.filter((el) => el.number.length)
				.map(({ number }) => number.replace(/\+s/g, "").replace(/-/, ""))
				.map(
					(number) =>
						`number ~ '${number}' || number ~ '${number.replace(/-/g, "")}'`,
				)
				.join(" || ")})`,
		).then((r) => r.json());
		setAlternatives(alternatives.items);
		console.log(oeNumbers.items[0]);
	}
	return (
		<main>
			<h1>DEMO</h1>
			<form onSubmit={search}>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value.trim())}
					className="border-2"
				/>
				<button className="border-2 mx-2 px-4">s</button>
			</form>
			<div>
				<span>{filter?.article}</span>
				<span className="mx-2 font-bold">{filter?.brand}</span>
				<br />
				<span>
					{filter?.application.split(";").map((el) => (
						<div key={el}>
							{el}
							<br />
						</div>
					))}
				</span>
			</div>
			<div>
				<h2>alternatives</h2>
				{alternatives?.map((alt, i) => (
					<>
						{alternatives[i - 1]?.article === alt.article ||
						alt.article === filter?.article ? null : (
							<div>
								<span>{alt?.article}</span>
								<span className="mx-2 font-bold">{alt?.brand}</span>
								<br />
								<span>
									{alt?.application?.split(";")?.map((el) => (
										<div key={el}>
											{el}
											<br />
										</div>
									))}
								</span>
							</div>
						)}
					</>
				))}
			</div>
		</main>
	);
}
