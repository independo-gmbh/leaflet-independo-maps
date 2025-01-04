import {PictogramMarker} from "../../pictogram-marker";
import {MarkerSortingService} from "../marker-sorting-service";
import L from "leaflet";

export interface GridSortingServiceOptions {
	/**
	 * The layout direction for the x-axis: "lr" (left-to-right) or "rl" (right-to-left).
	 *
	 * @default "lr"
	 */
	lr: "lr" | "rl";

	/**
	 * The layout direction for the y-axis: "tb" (top-to-bottom) or "bt" (bottom-to-top).
	 *
	 * @default "tb"
	 */
	tb: "tb" | "bt";

	/**
	 * The threshold in pixels to determine row separation.
	 *
	 * @default 64
	 */
	rowThreshold: number;
}

export class GridSortingService implements MarkerSortingService {
	private readonly lr: "lr" | "rl";
	private readonly tb: "tb" | "bt";
	private readonly rowThreshold: number;

	constructor(options?: GridSortingServiceOptions) {
		this.lr = options?.lr || "lr";
		this.tb = options?.tb || "tb";
		this.rowThreshold = options?.rowThreshold || 64;
	}

	/**
	 * Sorts the markers into a 2D grid based on the provided layout direction.
	 *
	 * @param markers An array of {@link PictogramMarker} instances to order.
	 * @param map The map is provided for context, e.g. to determine the current map bounds, mapping the coordinates
	 * to layer points, etc.
	 * @returns A promise resolving to the sorted markers.
	 */
	public async sortMarkers(markers: PictogramMarker[], map: L.Map): Promise<PictogramMarker[]> {
		const pixelData = markers.map(marker => {
			const latLng = marker.getLatLng();
			const point = map.latLngToLayerPoint(latLng);
			return {marker, point};
		});

		// Group markers into rows based on their y-coordinate
		const rows: { y: number; markers: typeof pixelData }[] = [];

		pixelData.forEach(data => {
			let row = rows.find(r => Math.abs(r.y - data.point.y) < this.rowThreshold);
			if (!row) {
				row = {y: data.point.y, markers: []};
				rows.push(row);
			}
			row.markers.push(data);
		});

		// Sort rows based on y-axis (top-to-bottom or bottom-to-top)
		rows.sort((a, b) => (this.tb === "tb" ? a.y - b.y : b.y - a.y));

		// Sort each row based on x-axis (left-to-right or right-to-left)
		rows.forEach(row => {
			row.markers.sort((a, b) => (this.lr === "lr" ? a.point.x - b.point.x : b.point.x - a.point.x));
		});

		// Flatten the 2D grid into a single array
		return rows
			.map(row => row.markers.map(data => data.marker))
			.reduce((acc, val) => acc.concat(val), []);
	}
}
