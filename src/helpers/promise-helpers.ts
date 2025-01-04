export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeout: number | undefined;
	return (...args: Parameters<T>) => {
		if (timeout !== undefined) {
			clearTimeout(timeout);
		}
		timeout = window.setTimeout(() => {
			func(...args).catch((error) => console.error('Debounced function error:', error));
		}, delay);
	};
}
