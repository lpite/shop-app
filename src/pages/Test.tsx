import { useEffect, useState } from "react";
import Show from "../utils/Show";

export default function TestPage() {
	const [intersected, setIntersected] = useState<any[]>([]);
	const [photos, setPhotos] = useState<string[]>([]);
	const [selected, setSelected] = useState<
		{ supCode: string; ourCode: string; photo: string }[]
	>([]);
	const [url, setUrl] = useState<string>("");

	useEffect(() => {
		fetch("/intersected.json")
			.then((r) => r.json())
			.then((j) => setIntersected(j));
		fetch("/photos.txt")
			.then((r) => r.text())
			.then((t) => {
				setPhotos(t.split("\n"));
			});
	}, []);
	useEffect(() => {
		const blob = new Blob([JSON.stringify(selected)]);
		const url = window.URL.createObjectURL(blob);
		setUrl(url);
	}, [selected]);

	return (
		<main className="mx-6">
			<h1 className="text-3xl">foto</h1>
			<a href={url} download="m.json" className="border-2 px-4 py-2">
				save
			</a>
			{intersected.map((el) => {
				const p = photos.filter(
					(photo) => photo.split("_")[0] === el["supp-code"],
				);
				return (
					<div
						key={el.searchCode}
						className="flex flex-col gap-2 my-2 border-b-2"
					>
						<div>
							<span>{el.name}</span>
							<span>{el.vendorCode}</span>
							<span>{el["supp-code"]}</span>

							<Show when={el.photo.length}>
								<span>old</span>
							</Show>
							<Show when={!p.length}>
								<span className="text-red-500 font-bold">no sup photo</span>
							</Show>
						</div>
						<div className="flex">
							{p.map((e, i) => (
								<img
									onClick={() => {
										if (selected.some((s) => s.photo === e)) {
											setSelected((p) => [...p.filter((s) => s.photo !== e)]);
										} else {
											setSelected((p) => [
												...p,
												{
													photo: e,
													ourCode: el.searchCode,
													supCode: el["supp-code"],
												},
											]);
										}
									}}
									key={e + i}
									className={`w-48 object-contain border-2 mx-2 ${selected.some((s) => s.photo === e) ? "border-green-500" : ""}`}
									// width={100}
									// height={100}
									src={`http://localhost:3000/${e}`}
								/>
								// <span key={e+i}>{e}</span>
							))}
						</div>
					</div>
				);
			})}
		</main>
	);
}
