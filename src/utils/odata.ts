type OdataResponse<T> = { "odata.error": string } | { value: T };

export function getOdataValue<T>(json: OdataResponse<T>) {
	if ("odata.error" in json) {
		throw new Error(json["odata.error"]);
	}

	return json.value;
}
