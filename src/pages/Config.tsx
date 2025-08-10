import { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

import {
	useConfig,
	configSchema,
	type ConfigKeys,
} from "../stores/configStore";

const shape = (configSchema as ZodObject<ZodRawShape>).shape;
const fields = Object.entries(shape) as [ConfigKeys, ZodTypeAny][];

const defaultInputs = ["text", "number", "url", "string"];
const typesReplacement: Record<string, string> = {
	string: "text",
	url: "string",
};

export function ConfigPage() {
	const config = useConfig();

	return (
		<main className="max-w-[1200px] mx-auto py-4 px-3">
			<h1 className="text-3xl font-medium">Конфігурація</h1>
			{fields.map(([name, field]) => {
				const fieldType = field.def.type as string;

				if (fieldType === "boolean") {
					return (
						<div className="p-2 flex">
							{name}
							<input
								type="checkbox"
								checked={config[name] as boolean}
								onChange={() => useConfig.setState({ [name]: !config[name] })}
								className="border mx-1 w-full px-1"
							/>
						</div>
					);
				}

				if (defaultInputs.indexOf(fieldType) !== -1) {
					return (
						<div className="p-2 flex">
							{name}
							<input
								type={
									typesReplacement[fieldType]
										? typesReplacement[fieldType]
										: fieldType
								}
								value={config[name] as string}
								onChange={(e) => useConfig.setState({ [name]: e.target.value })}
								className="border mx-1 w-full px-1"
							/>
						</div>
					);
				}

				// maybe sometime
				// if (
				// 	fieldType === "array" &&
				// 	field._def.element._def.type === "object"
				// ) {
				// 	const rows = config[name];
				// 	console.log(field._def.element._def);
				// 	const fieldsSchema = field._def.element._def.shape;
				// 	console.log(fields);
				// 	return (
				// 		<div className="flex flex-col">
				// 			{name}
				// 			<Dialog.Root>
				// 				<Dialog.Trigger>
				// 					<Plus />
				// 				</Dialog.Trigger>
				// 				<Dialog.Portal>
				// 					<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
				// 					<Dialog.Content className="fixed min-w-3/6 min-h-80 w-96 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
				// 						<Dialog.Title className="text-2xl pb-3 font-medium">
				// 							Нове
				// 						</Dialog.Title>
				// 						{Object.entries(fieldsSchema).map(([field]) => (
				// 							<label className="flex py-1">
				// 								{field}
				// 								<input className="border mx-1 w-full px-1" />
				// 							</label>
				// 						))}
				// 						<button className="px-2 py-1 border">Створити</button>
				// 					</Dialog.Content>
				// 				</Dialog.Portal>
				// 			</Dialog.Root>
				// 			{rows.map((m) => (
				// 				<div>{m.id}</div>
				// 			))}
				// 		</div>
				// 	);
				// }

				return (
					<div className="p-2">
						{name}
						not implemented;
					</div>
				);
			})}
		</main>
	);
}
