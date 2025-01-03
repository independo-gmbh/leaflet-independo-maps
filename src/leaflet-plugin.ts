import L from 'leaflet';
import {PictogramMarker} from "./pictogram-marker";
import {OverpassPOIService, OverpassPOIServiceOptions} from "./services/impl/overpass-poi-service";
import {
	GlobalSymbolsPictogramService,
	GlobalSymbolsPictogramServiceOptions
} from "./services/impl/global-symbols-p-service";
import {PointOfInterestService} from "./services/point-of-interest-service";
import {PictogramService} from "./services/pictogram-service";

/**
 * Options for configuring the Independo Maps plugin.
 */
export interface IndependoMapsOptions {

	/**
	 * Options for configuring the default {@link OverpassPOIService}.
	 *
	 * These options are used if no custom `poiService` is provided.
	 * Allows customization of the Overpass API endpoint, default types, and other service-specific behaviors.
	 *
	 * @example
	 * ```typescript
	 * overpassServiceOptions: {
	 *   apiUrl: "https://custom-overpass-api.com",
	 *   defaultLimit: 50,
	 *   defaultTypes: ["amenity", "shop", "tourism"]
	 * };
	 * ```
	 */
	overpassServiceOptions?: OverpassPOIServiceOptions;

	/**
	 * Options for configuring the default {@link GlobalSymbolsPictogramService}.
	 *
	 * These options are used if no custom `pictogramService` is provided.
	 * Allows customization of behavior such as including types in display text and symbol set selection.
	 *
	 * @example
	 * ```typescript
	 * globalSymbolsServiceOptions: {
	 *   includeTypeInDisplayText: true,
	 *   symbolSet: "your-custom-symbolset"
	 * };
	 * ```
	 */
	globalSymbolsServiceOptions?: GlobalSymbolsPictogramServiceOptions;

	/**
	 * Custom implementation of the {@link PointOfInterestService}.
	 *
	 * Use this field to provide your own service for fetching points of interest (POIs).
	 * If not provided, the plugin will default to an instance of {@link OverpassPOIService}.
	 *
	 * @example
	 * ```typescript
	 * poiService: new CustomPOIService();
	 * ```
	 */
	poiService?: PointOfInterestService;

	/**
	 * Custom implementation of the {@link PictogramService}.
	 *
	 * Use this field to provide your own service for fetching pictograms for POIs.
	 * If not provided, the plugin will default to an instance of {@link GlobalSymbolsPictogramService}.
	 *
	 * @example
	 * ```typescript
	 * pictogramService: new CustomPictogramService();
	 * ```
	 */
	pictogramService?: PictogramService;
}

export class IndependoMaps {
	private map: L.Map;
	private readonly poiLayerGroup: L.LayerGroup<PictogramMarker>;
	private readonly poiService: PointOfInterestService;
	private readonly pictogramService: PictogramService;

	constructor(map: L.Map, options?: IndependoMapsOptions) {
		this.map = map;
		this.poiLayerGroup = new L.LayerGroup<PictogramMarker>();

		// Initialize services based on provided options or defaults
		this.poiService =
			options?.poiService ||
			new OverpassPOIService(options?.overpassServiceOptions || {defaultLimit: 10});

		this.pictogramService =
			options?.pictogramService ||
			new GlobalSymbolsPictogramService(options?.globalSymbolsServiceOptions || {});

		// Add the POI layer group to the map
		this.map.addLayer(this.poiLayerGroup);

		// Attach event listeners
		this.map.on('moveend zoomend', this.updateMap.bind(this));

		// Perform an initial update
		this.updateMap();
	}

	/**
	 * Updates the map by fetching POIs and adding corresponding markers.
	 */
	private async updateMap(): Promise<void> {
		const bounds = this.map.getBounds();
		const pointsOfInterest = await this.poiService.getPointsOfInterest(bounds);

		const markerPromises = pointsOfInterest.map(async (poi) => {
			const latlng = L.latLng(poi.latitude, poi.longitude);
			const pictogram = await this.pictogramService.getPictogram(poi);
			if (!pictogram) return undefined;
			return new PictogramMarker(latlng, {pictogram, pointOfInterest: poi});
		});

		const layers = (await Promise.all(markerPromises))
			.filter((layer): layer is PictogramMarker => layer !== undefined);

		// TODO: order pictograms into grid so that tab order is logical (left to right, top to bottom)

		this.poiLayerGroup.clearLayers();
		layers.forEach((layer) => this.poiLayerGroup.addLayer(layer));
	}
}

/**
 * Initializes the Independo Maps plugin on a {@link L.Map} and returns an instance of the plugin.
 *
 * @param map The {@link L.Map} to initialize the plugin on.
 * @param options Optional {@link IndependoMapsOptions} to configure the plugin.
 * @returns An instance of {@link IndependoMaps}.
 */
export function initIndependoMaps(map: L.Map, options?: IndependoMapsOptions): IndependoMaps {
	return new IndependoMaps(map, options);
}
