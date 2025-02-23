// import { useEffect, useState } from "react";
// import CommandPalette, { filterItems, getItemIndex } from "react-cmdk";

// import "react-cmdk/dist/cmdk.css";

// export default function TestPage() {
// 	const [open, setOpen] = useState<boolean>(true);
// 	const [search, setSearch] = useState("");
// 	const [t, setT] = useState<any>([{ heading: "home", id: "home", items: [] }]);
// 	const filteredItems = filterItems(t, search)

// 	useEffect(() => {
// 		const r = fetch("https://api.sampleapis.com/beers/ale")
// 			.then(res => res.json())
// 			.then((r) => {
// 				// console.log(r)
// 				// setT([{ heading: "Послуги та товари", id: "hone", items: r.map(el => ({ id: el.id, children: el.name })) }])
// 			})
// 	}, [])

// 	return (
// 		<main>
// 			{Array(10).fill("").map((_, i) => (
// 				<div className="border p-3 m-1 rounded-lg">
// 					<div className="flex items-around">Номер {i + 1} 12.12.24</div>

// 					<div className="flex items-around">Сума: 1231.12</div>

// 				</div>
// 			))}
// 			<button onClick={() => setOpen(true)}>open</button>
// 			<CommandPalette
// 				onChangeSearch={setSearch}
// 				onChangeOpen={setOpen}
// 				search={search}
// 				isOpen={open}
// 				page="root"
// 			>
// 				<CommandPalette.Page id="root">
// 					{filteredItems?.length ? (
// 						filteredItems?.map((list) => (
// 							<CommandPalette.List key={list.id} heading={list.heading}>
// 								{list?.items.map(({ id, ...rest }) => (
// 									<CommandPalette.ListItem
// 										key={id}
// 										index={getItemIndex(filteredItems, id)}

// 										{...rest}
// 									/>
// 								))}
// 							</CommandPalette.List>
// 						))
// 					) : (
// 						<CommandPalette.FreeSearchAction label="Додати" onClick={() => setOpen(false)} />
// 					)}
// 				</CommandPalette.Page>
// 			</CommandPalette>
// 		</main>
// 	)
// }
