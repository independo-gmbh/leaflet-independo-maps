/**
 * @description Capitalizes the first letter of each word in a string
 * @param str The string to capitalize
 */
export function nameify(str: string): string {
	return str
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
