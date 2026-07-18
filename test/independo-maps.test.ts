import type L from "leaflet";
import {afterEach, describe, expect, it, vi} from "vitest";
import {IndependoMaps, initIndependoMaps} from "../src/leaflet-plugin";
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

	// Characterization test for a KNOWN latent bug (see plan open item):
	// when the pictogram service returns undefined, updateMap returns the raw
	// `defaultPictogram` (a Pictogram) where a PictogramMarker is expected, so a
	// non-marker leaks into the sorting/layer pipeline. This documents current
	// behavior; it should be fixed in a separate `fix:` commit if approved.
	it("[bug] leaks the raw defaultPictogram into the marker pipeline when no pictogram is found", async () => {
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
		expect(captured).toContain(defaultPictogram);
	});
});
