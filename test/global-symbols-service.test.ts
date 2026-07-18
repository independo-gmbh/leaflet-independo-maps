import {afterEach, describe, expect, it, vi} from "vitest";
import {GlobalSymbolsPictogramService} from "../src/services/impl/global-symbols-p-service";
import type {PointOfInterest} from "../src/models/point-of-interest";

const poi: PointOfInterest = {
	id: "1",
	name: "Cafe Mozart",
	type: "cafe",
	latitude: 48.2,
	longitude: 16.3,
};

const apiResult = [
	{
		id: 7,
		picto: {image_url: "https://example.com/p.png"},
		description: "A cafe pictogram",
	},
];

function mockFetch(payload: unknown) {
	const fetchMock = vi.fn(async () => ({
		ok: true,
		status: 200,
		statusText: "",
		json: async () => payload,
	}));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

describe("GlobalSymbolsPictogramService.getPictogram", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("constructs a pictogram from the first API result", async () => {
		mockFetch(apiResult);
		const service = new GlobalSymbolsPictogramService({cacheStrategy: "in-memory"});

		const pictogram = await service.getPictogram(poi);

		expect(pictogram).toMatchObject({
			id: "7",
			url: "https://example.com/p.png",
			displayText: "Cafe Mozart", // includeTypeInDisplayText defaults to false
			ariaLabel: "Cafe: Cafe Mozart", // includeTypeInAriaLabel defaults to true
			description: "A cafe pictogram",
		});
	});

	it("returns undefined when the API yields no results", async () => {
		mockFetch([]);
		const service = new GlobalSymbolsPictogramService({cacheStrategy: "in-memory"});

		expect(await service.getPictogram(poi)).toBeUndefined();
	});

	it("includes the type in the display text when configured", async () => {
		mockFetch(apiResult);
		const service = new GlobalSymbolsPictogramService({
			cacheStrategy: "in-memory",
			includeTypeInDisplayText: true,
		});

		const pictogram = await service.getPictogram(poi);

		expect(pictogram?.displayText).toBe("Cafe: Cafe Mozart");
	});

	it("caches results so a repeated lookup does not hit the network again", async () => {
		const fetchMock = mockFetch(apiResult);
		const service = new GlobalSymbolsPictogramService({cacheStrategy: "in-memory"});

		await service.getPictogram(poi);
		await service.getPictogram(poi);

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
