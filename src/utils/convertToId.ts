export default function convertToId(searchCode: string) {
  return "0".repeat(8 - searchCode.length) + searchCode;
}
