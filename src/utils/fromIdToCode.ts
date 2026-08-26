export function fromIdToCode(id: string) {
	return id.replace(/^0+-0*/, "");
}
