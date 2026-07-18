import type {LatLngBounds} from "leaflet";
import {afterEach, describe, expect, it, vi} from "vitest";
import {OverpassPOIService} from "../src/services/impl/overpass-poi-service";

const bounds = {
	getSouth: () => 48.0,
	getWest: () => 16.0,
	getNorth: () => 48.3,
	getEast: () => 16.4,
} as unknown as LatLngBounds;

function mockFetch(response: {ok: boolean; status?: number; json?: () => unknown}) {
	const fetchMock = vi.fn(async () => ({
		ok: response.ok,
		status: response.status ?? (response.ok ? 200 : 500),
		statusText: "",
		json: async () => (response.json ? response.json() : {}),
	}));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("OverpassPOIService.getPointsOfInterest", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("short-circuits to an empty list (without fetching) when types is an empty array", async () => {
		const fetchMock = mockFetch({ok: true, json: () => ({elements: []})});
		const service = new OverpassPOIService();

		const result = await service.getPointsOfInterest(bounds, {types: []});

		expect(result).toEqual([]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("maps Overpass elements to POIs, derives names, and filters nameless ones", async () => {
		const elements = [
			{id: 1, lat: 48.2, lon: 16.3, tags: {name: "Cafe Mozart", amenity: "cafe"}},
			{id: 2, center: {lat: 48.1, lon: 16.2}, tags: {shop: "bakery"}},
			{id: 3, lat: 48.05, lon: 16.05, tags: {}},
		];
		const fetchMock = mockFetch({ok: true, json: () => ({elements})});
		const service = new OverpassPOIService();

		const result = await service.getPointsOfInterest(bounds);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		// Element 3 has no name and no derivable type -> filtered out.
		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({id: "1", name: "Cafe Mozart", type: "cafe", latitude: 48.2, longitude: 16.3});
		// Element 2 has no name but a type -> name derived from type via nameify.
		expect(result[1]).toMatchObject({id: "2", name: "Bakery", type: "bakery", latitude: 48.1, longitude: 16.2});
	});

	it("requests the configured API url", async () => {
		const fetchMock = mockFetch({ok: true, json: () => ({elements: []})});
		const service = new OverpassPOIService({apiUrl: "https://example.com/overpass"});

		await service.getPointsOfInterest(bounds);

		expect(String(fetchMock.mock.calls[0][0])).toContain("https://example.com/overpass");
	});

	it("returns an empty list when a non-retryable error response is received", async () => {
		mockFetch({ok: false, status: 500});
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const service = new OverpassPOIService({maxRetries: 0});

		const result = await service.getPointsOfInterest(bounds);

		expect(result).toEqual([]);
		expect(consoleError).toHaveBeenCalled();
	});
});
