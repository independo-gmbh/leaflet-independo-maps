import type L from "leaflet";
import {describe, expect, it} from "vitest";
import {GridSortingService} from "../src/services/impl/grid-sorting-service";
import type {PictogramMarker} from "../src/pictogram-marker";

/**
 * Builds a fake map + marker pair where each marker's "latlng" is just its id,
 * and the map resolves that id back to a fixed layer point. This lets us drive
 * {@link GridSortingService.sortMarkers} deterministically without a real map.
 */
function scenario(points: Record<string, {x: number; y: number}>) {
	const markers = Object.keys(points).map(
		(id) => ({getLatLng: () => id}) as unknown as PictogramMarker,
	);
	const map = {
		latLngToLayerPoint: (id: unknown) => points[id as string],
	} as unknown as L.Map;
	return {markers, map};
}

function ids(markers: PictogramMarker[]): string[] {
	return markers.map((m) => m.getLatLng() as unknown as string);
}

describe("GridSortingService.sortMarkers", () => {
	const points = {
		A: {x: 10, y: 10},
		B: {x: 5, y: 12}, // same row as A (|10-12| < 64)
		C: {x: 0, y: 100}, // separate row
	};

	it("orders left-to-right, top-to-bottom by default", async () => {
		const {markers, map} = scenario(points);
		const sorted = await new GridSortingService().sortMarkers(markers, map);
		expect(ids(sorted)).toEqual(["B", "A", "C"]);
	});

	it("honors right-to-left within a row", async () => {
		const {markers, map} = scenario(points);
		const service = new GridSortingService({lr: "rl", tb: "tb", rowThreshold: 64});
		const sorted = await service.sortMarkers(markers, map);
		expect(ids(sorted)).toEqual(["A", "B", "C"]);
	});

	it("honors bottom-to-top row ordering", async () => {
		const {markers, map} = scenario(points);
		const service = new GridSortingService({lr: "lr", tb: "bt", rowThreshold: 64});
		const sorted = await service.sortMarkers(markers, map);
		expect(ids(sorted)).toEqual(["C", "B", "A"]);
	});

	it("separates markers into different rows once they exceed the row threshold", async () => {
		const {markers, map} = scenario({A: {x: 10, y: 10}, B: {x: 5, y: 40}});
		const service = new GridSortingService({lr: "lr", tb: "tb", rowThreshold: 16});
		const sorted = await service.sortMarkers(markers, map);
		// |10 - 40| = 30 >= 16, so A (top row) precedes B (bottom row) regardless of x.
		expect(ids(sorted)).toEqual(["A", "B"]);
	});
});
