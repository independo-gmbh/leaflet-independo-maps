/**
 * Options for querying points of interest within a specified geographic area.
 *
 * Implementations should adhere to the following behaviors:
 * - If the `types` array is not provided, the query should include all available types.
 * - If the `types` array is provided but is empty, the query should exclude all results (no types match).
 * - The `limit` specifies the maximum number of results and should be respected when provided.
 * - The `metadata` field allows for additional, implementation-specific query parameters.
 */
export interface PointOfInterestQueryOptions {
	/**
	 * A list of types or categories to filter the results.
	 * - If this field is omitted, the query should include all available types.
	 * - If this field is provided as an empty array, the query should return no results.
	 * Examples: ["restaurant", "park", "museum"].
	 */
	types?: string[];

	/**
	 * The maximum number of results to return.
	 * If omitted, the implementation should return all results or the default maximum limit.
	 * Example: 50.
	 */
	limit?: number;

	/**
	 * A flexible container for any additional options specific to the implementation.
	 * This can include fields such as `openNow` (only return currently open places), `radius`, or API-specific flags.
	 */
	metadata?: Record<string, any>;
}
