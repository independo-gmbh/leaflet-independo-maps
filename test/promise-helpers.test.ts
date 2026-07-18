import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {debounceAsync} from "../src/helpers/promise-helpers";

describe("debounceAsync", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it("invokes the wrapped function only after the delay elapses", () => {
		const fn = vi.fn(async () => undefined);
		const debounced = debounceAsync(fn, 300);

		debounced();
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(299);
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("collapses rapid calls into a single trailing invocation with the latest args", () => {
		const fn = vi.fn(async () => undefined);
		const debounced = debounceAsync(fn, 300);

		debounced("a");
		debounced("b");
		debounced("c");

		vi.advanceTimersByTime(300);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("c");
	});

	it("swallows rejections from the wrapped function instead of throwing", async () => {
		const error = new Error("boom");
		const fn = vi.fn(async () => {
			throw error;
		});
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const debounced = debounceAsync(fn, 300);

		debounced();
		await vi.advanceTimersByTimeAsync(300);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(consoleError).toHaveBeenCalledWith("Debounced function error:", error);
	});
});
