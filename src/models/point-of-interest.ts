/**
 * Represents a single point of interest (POI).
 *
 * A Point of Interest (POI) is a location that has specific significance,
 * such as a restaurant, park, store, landmark, or other notable place.
 * Each POI contains key information such as its name, type, and geographic location.
 */
export interface PointOfInterest {
	/**
	 * A unique identifier for the point of interest.
	 * This ID is provided by the underlying data source (e.g., Google Places, Overpass API).
	 */
	id: string;

	/**
	 * The human-readable name of the point of interest.
	 * @example "Cafe Mozart", "Schönbrunn Palace"
	 */
	name: string;

	/**
	 * The category or type of the point of interest.
	 * @example "restaurant", "park", "museum"
	 */
	type: string;

	/**
	 * The latitude coordinate of the point of interest.
	 */
	latitude: number;

	/**
	 * The longitude coordinate of the point of interest.
	 */
	longitude: number;

	/**
	 * An optional address or description of the point of interest.
	 * @example "Albertinaplatz 2, 1010 Wien, Austria"
	 */
	address?: string;

	/**
	 * A flexible container for any additional metadata from the data source.
	 * E.g. operational hours, tags, or other details.
	 */
	metadata?: Record<string, any>;
}
