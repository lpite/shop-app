import { FormEvent, Fragment, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useSettings } from "../stores/settingsStore";
import { Link, useLocation } from "wouter";

type VinSearchResponse = {
	found_by: string;
	type: string;
	vehicle?: {
		brand: string;
		catalog: string;
		name: string;
		ssd: string;
		vehicleid: string;
		vin_code: string;
	};
};

type GroupsElement = {
	name: string;
	units: string;
	children: Record<string, GroupsElement>;
};

type GroupsResponse = {
	quick_groups: Record<
		string,
		{
			name: string;
			units: boolean;
			children: Record<string, GroupsElement>;
		}
	>;
};

type GroupResponse = {
	quick_group: Record<
		string,
		{
			category: {
				category_code: string;
				code: string;
				name: string;
				ssd: string;
			};
			units: {
				additional_details: unknown[];
				code: string;
				details: {
					amount: string;
					codeonimage: string;
					extra: Record<string, unknown>[];
					name: string;
					note: null | unknown;
					oem: string;
					replPart: null | unknown;
					ssd: string;
				}[];
				image_url: string;
				imageurl: string;
				largeimageurl: string;
				name: string;
				ssd: string;
				unitid: string;
			}[];
		}
	>;
};

export default function SearchByVin() {
	const [searchValue, setSearchValue] = useState("");
	const [groups, setGroups] = useState<GroupsResponse | undefined>();
	const [items, setItems] = useState<
		GroupResponse["quick_group"]["0"] | undefined
	>();
	const [vehicle, setVehicle] = useState({
		vehicleid: "",
		catalog: "",
		ssd: "",
	});

	const [isLoading, setIsLoading] = useState(false);

	const { pb_base_url } = useSettings();

	useEffect(() => {
		if (!pb_base_url) {
			useSettings.setState({
				pb_base_url: "",
			});
		}
	}, []);
	async function search(e: FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		const vinResponse = (await fetch(
			`${pb_base_url}/api/vin/search/${searchValue}`,
		)
			.then((r) => r.json())
			.catch((err) => {
				console.error(err);
				setIsLoading(false);
				alert("Сталася помилка (пошук VIN)");
			})) as VinSearchResponse | undefined;
		if (!vinResponse || !vinResponse.vehicle) {
			return;
		}
		const vehicle = vinResponse.vehicle;
		setVehicle(vehicle);

		const groups = (await fetch(`${pb_base_url}/api/vin/quick_groups`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				vehicle_id: vehicle.vehicleid,
				catalog_code: vehicle.catalog,
				ssd: vehicle.ssd,
			}),
		})
			.then((r) => r.json())
			.catch((err) => {
				console.error(err);
				alert("Сталася помилка (Групи)");
			})
			.finally(() => {
				setIsLoading(false);
			})) as GroupsResponse | undefined;

		setGroups(groups);
	}

	async function getItems(id: string) {
		setIsLoading(true);
		const group = (await fetch(`${pb_base_url}/api/vin/quick_group`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				vehicle_id: vehicle.vehicleid,
				catalog_code: vehicle.catalog,
				ssd: vehicle.ssd,
				quick_group_id: id,
			}),
		})
			.then((r) => r.json())
			.catch((err) => {
				console.error(err);
				alert("Сталася помилка (Група)");
			})
			.finally(() => {
				setIsLoading(false);
			})) as GroupResponse | undefined;
		if (!group) {
			return;
		}
		setItems(group.quick_group["0"]);
		setShowPopup(true);
	}
	const [showPopup, setShowPopup] = useState(false);
	return (
		<main className="py-4 flex flex-col items-center w-full">
			{isLoading ? (
				<div className="fixed start-0 top-0 end-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center z-20">
					<div className="w-24 h-24 border-8 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
				</div>
			) : null}

			<Dialog.Root open={showPopup} onOpenChange={setShowPopup}>
				<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25 z-10" />
				<Dialog.Content className="fixed w-3/6 h-4/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg flex flex-col z-20">
					<Dialog.Title className="text-2xl pb-3 font-medium">
						Список
					</Dialog.Title>
					{items?.units?.map((unit) => (
						<Fragment key={unit.unitid}>
							<h2 className="mt-2 font-medium">{unit.name}</h2>
							{Object.values(unit?.details || {}).map((detail, i) => (
								<a
									key={unit.unitid + detail.oem}
									href={`/suppliers-search?q=${detail.oem}`}
									target="_blank"
									className="border-2 px-2 py-1 my-1"
								>
									<div className="flex gap-2 ">
										<span className="font-medium">#{i + 1}</span>
										<span>{detail.name}</span>
									</div>
									<div className="flex gap-2">
										<span>Кількість: {detail.amount}</span>
										<span>ОЕМ: {detail.oem}</span>
									</div>
								</a>
							))}
						</Fragment>
					))}
				</Dialog.Content>
			</Dialog.Root>
			<button
				onClick={() => history.go(-1)}
				className="fixed top-0 left-8 bg-sky-300 h-12 mt-8 mr-12 flex items-center px-8 z-10 rounded-lg"
			>
				назад
			</button>
			<div className="fixed top-0 bg-white w-full flex justify-center">
				<form
					className="border-2 mt-8 w-2/6 px-2 rounded-xl flex items-center"
					onSubmit={search}
				>
					<input
						className="w-full h-12 text-xl rounded-xl outline-none"
						placeholder="VIN"
						onChange={(e) => setSearchValue(e.target.value)}
						value={searchValue}
						maxLength={17}
					/>
					<span className="text-gray-400 pr-4">{17 - searchValue.length}</span>
					<button
						className="h-10 w-10 text-gray-600 flex items-center justify-center hover:bg-black hover:bg-opacity-20 rounded-lg disabled:bg-gray-400"
						disabled={isLoading}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
						</svg>
					</button>
				</form>
			</div>
			<div className="pt-20 flex flex-col gap-1  w-3/6">
				{groups?.quick_groups &&
					groups?.quick_groups["0"] &&
					Object.entries(groups?.quick_groups["0"]?.children["1"].children).map(
						([k, v]) => (
							<button
								key={k}
								className="border-2 p-2 rounded-lg"
								onClick={() => getItems(k)}
							>
								{v.name}
							</button>
						),
					)}
			</div>
		</main>
	);
}
