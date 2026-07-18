import type L from "leaflet";
import {afterEach, describe, expect, it, vi} from "vitest";
import {IndependoMaps, initIndependoMaps} from "../src/leaflet-plugin";
import {PictogramMarker} from "../src/pictogram-marker";
import type {PointOfInterest} from "../src/models/point-of-interest";
import type {Pictogram} from "../src/models/pictogram";

function fakeMap() {
	return {
		addLayer: vi.fn(),
		on: vi.fn(),
		getBounds: vi.fn(() => ({}) as unknown as L.LatLngBounds),
	} as unknown as L.Map;
}

const poi: PointOfInterest = {id: "1", name: "Cafe", type: "cafe", latitude: 48.2, longitude: 16.3};

describe("initIndependoMaps / IndependoMaps", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns an IndependoMaps instance and wires the plugin onto the map", async () => {
		const map = fakeMap();
		const poiService = {getPointsOfInterest: vi.fn(async () => [])};
		const pictogramService = {getPictogram: vi.fn(async () => undefined)};

		const instance = initIndependoMaps(map, {poiService, pictogramService} as unknown as never);

		expect(instance).toBeInstanceOf(IndependoMaps);
		// The POI layer group is added to the map exactly once on construction.
		expect(map.addLayer).toHaveBeenCalledTimes(1);
		// A debounced handler is registered for both move and zoom end events.
		expect(map.on).toHaveBeenCalledWith("moveend zoomend", expect.any(Function));
		// Construction triggers an initial update pass.
		await vi.waitFor(() => expect(poiService.getPointsOfInterest).toHaveBeenCalled());
	});

	it("builds a marker from defaultPictogram when no pictogram is found for a POI", async () => {
		const captured: unknown[] = [];
		const sortMarkers = vi.fn(async (markers: unknown[]) => {
			captured.push(...markers);
			return [] as never;
		});
		const defaultPictogram: Pictogram = {id: "d", url: "x", displayText: "Default"};

		new IndependoMaps(fakeMap(), {
			poiService: {getPointsOfInterest: async () => [poi]},
			pictogramService: {getPictogram: async () => undefined},
			markerSortingService: {sortMarkers},
			defaultPictogram,
		} as unknown as never);

		await vi.waitFor(() => expect(sortMarkers).toHaveBeenCalled());
		// A real marker is produced at the POI location, not the raw Pictogram object.
		expect(captured).toHaveLength(1);
		expect(captured[0]).toBeInstanceOf(PictogramMarker);
		expect(captured).not.toContain(defaultPictogram);
		const marker = captured[0] as PictogramMarker;
		expect(marker.getLatLng().lat).toBeCloseTo(poi.latitude);
		expect(marker.getLatLng().lng).toBeCloseTo(poi.longitude);
	});

	it("skips the POI when no pictogram is found and no defaultPictogram is configured", async () => {
		const captured: unknown[] = [];
		const sortMarkers = vi.fn(async (markers: unknown[]) => {
			captured.push(...markers);
			return [] as never;
		});

		new IndependoMaps(fakeMap(), {
			poiService: {getPointsOfInterest: async () => [poi]},
			pictogramService: {getPictogram: async () => undefined},
			markerSortingService: {sortMarkers},
		} as unknown as never);

		await vi.waitFor(() => expect(sortMarkers).toHaveBeenCalled());
		expect(captured).toHaveLength(0);
	});
});
