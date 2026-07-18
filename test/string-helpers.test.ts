import {describe, expect, it} from "vitest";
import {nameify} from "../src/helpers/string-helpers";

describe("nameify", () => {
	it("capitalizes a single word", () => {
		expect(nameify("restaurant")).toBe("Restaurant");
	});

	it("splits on underscores and capitalizes each word", () => {
		expect(nameify("fast_food")).toBe("Fast Food");
		expect(nameify("place_of_worship")).toBe("Place Of Worship");
	});

	it("returns an empty string unchanged", () => {
		expect(nameify("")).toBe("");
	});

	it("leaves already-capitalized words capitalized", () => {
		expect(nameify("Museum")).toBe("Museum");
	});
});
