import {LatLngBounds} from "leaflet";
import {PointOfInterestQueryOptions} from "../../models/point-of-interest-query-options";
import {PointOfInterest} from "../../models/point-of-interest";
import {PointOfInterestService} from "../point-of-interest-service";
import {nameify} from "../../helpers/string-helpers";

/**
 * Options for configuring the OverpassPOIService.
 */
export interface OverpassPOIServiceOptions {
    /**
     * The base URL of the Overpass API endpoint.
     *
     * @default "https://overpass-api.de/api/interpreter".
     * @see https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances Public Overpass API instances
     */
    apiUrl?: string;

    /**
     * Default types of points of interest to query if none are provided in the {@link PointOfInterestQueryOptions}
     * object in the {@link getPointsOfInterest} method.
     *
     * @default ["shop", "leisure"]
     * @see https://wiki.openstreetmap.org/wiki/Key:shop
     * @see https://wiki.openstreetmap.org/wiki/Key:leisure
     */
    defaultTypes?: string[];

    /**
     * OpenStreetMap types to query.
     * Possible values: "node", "way", "relation".
     *
     * @default ["node"]
     * @see https://wiki.openstreetmap.org/wiki/Elements
     */
    osmTypes?: string[];

    /**
     * Default number of points of interest to query if no limit is provided in the {@link PointOfInterestQueryOptions}
     * object in the {@link getPointsOfInterest} method.
     *
     * @default 25
     */
    defaultLimit?: number;

    /**
     * Maximum number of retries for requests in case of rate limiting or server errors.
     *
     * @default 3
     */
    maxRetries?: number;

    /**
     * Timeout between retries in milliseconds.
     *
     * @default 1000
     */
    retryDelay?: number;

    /**
     * Timeout for a single request in seconds.
     *
     * @default 25
     */
    timeout?: number;

    /**
     * Whether to try to derive names for POIs with no name from their type.
     *
     * Some POIs may not have a name, but they have a type (e.g., "restaurant"). If this option is enabled,
     * the service will try to derive a generic name for the {@link PointOfInterest} from the type (e.g., "Restaurant").
     *
     * @default true
     */
    deriveNames?: boolean;

    /**
     * Whether to filter out POIs with no name.
     *
     * If this option is enabled, POIs with no name will be filtered out from the results.
     * Otherwise, POIs with no name will be included in the results and will have the name "Unknown".
     *
     * @default true
     */
    filterOutNoName?: boolean;
}

/**
 * Implementation of the PointOfInterestService interface using the Overpass API.
 */
export class OverpassPOIService implements PointOfInterestService {
    private readonly apiUrl: string;
    private readonly defaultTypes: string[];
    private readonly osmTypes: string[];
    private readonly defaultLimit: number;
    private readonly maxRetries: number;
    private readonly retryDelay: number;
    private readonly timeout: number;
    private readonly deriveNames: boolean;
    private readonly filterOutNoName: boolean;

    constructor(options?: OverpassPOIServiceOptions) {
        this.apiUrl = options?.apiUrl || "https://overpass-api.de/api/interpreter";
        this.defaultTypes = options?.defaultTypes || ["shop", "leisure"];
        this.osmTypes = options?.osmTypes || ["node"];
        this.defaultLimit = options?.defaultLimit || 25;
        this.maxRetries = options?.maxRetries || 3;
        this.retryDelay = options?.retryDelay || 1000;
        this.timeout = options?.timeout || 25;
        this.deriveNames = options?.deriveNames ?? true;
        this.filterOutNoName = options?.filterOutNoName ?? true;
    }

    /** @inheritDoc */
    public async getPointsOfInterest(bounds: LatLngBounds, options?: PointOfInterestQueryOptions): Promise<PointOfInterest[]> {
        let {types = undefined, limit = this.defaultLimit} = options || {};

        if (types?.length === 0) {
            return [];
        }

        if (types === undefined) {
            types = this.defaultTypes;
        }

        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
        const queries = types.map((type) => `${this.osmTypes.map((osmType) => `${osmType}["${type}"](${bbox});`).join("")}`);
        const query = `
      [out:json][timeout:${this.timeout}];
      (${queries.join("")});
      out center ${limit};
    `;

        return this.fetchWithRetry(query, this.maxRetries);
    }

    private async fetchWithRetry(query: string, retries: number): Promise<PointOfInterest[]> {
        try {
            const response = await fetch(`${this.apiUrl}?data=${encodeURIComponent(query)}`);
            if (!response.ok) {
                if ([409, 504].includes(response.status) && retries > 0) {
                    console.warn(`Rate limit or server error, retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                    return this.fetchWithRetry(query, retries - 1);
                }
                throw new Error(`Failed to fetch data from Overpass API: ${response.statusText}`);
            }

            const data = await response.json();
            return this.processResults(data.elements);
        } catch (error) {
            console.error("Error fetching POI data from Overpass API:", error);
            return [];
        }
    }

    private processResults(elements: any[]): PointOfInterest[] {
        return elements
            .filter((element: any) => element.lat || element.center?.lat)
            .filter((element: any) => element.lon || element.center?.lon)
            .map((element: any) => ({
                id: element.id.toString(),
                name: element.tags?.name || "Unknown",
                type: element.tags?.amenity || element.tags?.shop || "Unknown",
                latitude: element.lat || element.center?.lat,
                longitude: element.lon || element.center?.lon,
                address: this.buildAddress(element.tags),
                metadata: element || {},
            }))
            .map((poi: PointOfInterest) => {
                if (!this.deriveNames) return poi;
                if (poi.name === "Unknown" && poi.type !== "Unknown") {
                    poi.name = nameify(poi.type);
                }
                return poi;
            })
            .filter((poi: PointOfInterest) => !this.filterOutNoName || poi.name !== "Unknown");
    }

    private buildAddress(tags: any) {
        const street = tags?.['addr:street'] ?? "";
        const houseNumber = tags?.['addr:housenumber'] ?? "";
        const city = tags?.['addr:city'] ?? "";
        const postcode = tags?.['addr:postcode'] ?? "";
        const str = `${street} ${houseNumber}, ${postcode} ${city}`.trim();
        return str === "," ? undefined : str;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
