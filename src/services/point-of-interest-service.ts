import {LatLngBounds} from "leaflet";
import {PointOfInterest} from "../models/point-of-interest";
import {PointOfInterestQueryOptions} from "../models/point-of-interest-query-options";

/**
 * Abstract interface for a service that fetches points of interest (POIs)
 * within a specified geographic area.
 *
 * Implementations of this interface should:
 * - Query a data source (e.g., Google Places API, Overpass API, or Apple Maps Server API).
 * - Adhere to the filtering and behavior rules defined in `PointOfInterestQueryOptions`.
 * - Return a list of POIs with standardized fields as defined in `PointOfInterest`.
 */
export interface PointOfInterestService {
	/**
	 * Fetches a list of points of interest within the given bounds.
	 *
	 * @param bounds - The geographic bounds for the query. Specifies the area to search for POIs.
	 * @param options - Optional filters and query settings.
	 * - If `types` is omitted, all available POI types should be included in the query.
	 * - If `types` is an empty array, no POIs should be returned.
	 * - If `limit` is specified, the implementation should respect this value.
	 * @returns A promise resolving to an array of POIs.
	 */
	getPointsOfInterest(bounds: LatLngBounds, options?: PointOfInterestQueryOptions): Promise<PointOfInterest[]>;
}
