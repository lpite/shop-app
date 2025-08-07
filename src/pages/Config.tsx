import { ZodObject, ZodRawShape } from "zod";
import { useConfig, configSchema, type Config } from "../stores/configStore";

const shape = (configSchema as ZodObject<ZodRawShape>).shape;
const fields = Object.entries(shape);

const defaultInputs = ["text", "number", "boolean", "url", "string"];
const typesReplacement: Record<string, string> = {
	string: "text",
	boolean: "checkbox",
	url: "string",
};

export function Config() {
	const {} = useConfig();

	return (
		<main className="max-w-[1200px] mx-auto py-4 px-3">
			<h1 className="text-3xl font-medium">Конфігурація</h1>
			{fields.map(([name, field]) => {
				//@ts-expect-error not a public api
				const fieldType = field._def.type as string;
				console.log(field._def);
				if (defaultInputs.indexOf(fieldType) !== -1) {
					return (
						<div className="p-2">
							{name}
							<input
								type={
									typesReplacement[fieldType]
										? typesReplacement[fieldType]
										: fieldType
								}
								className="border mx-1"
							/>
						</div>
					);
				}

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
