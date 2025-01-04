import L from 'leaflet';
import {PictogramMarker} from "./pictogram-marker";
import {OverpassPOIService, OverpassPOIServiceOptions} from "./services/impl/overpass-poi-service";
import {
	GlobalSymbolsPictogramService,
	GlobalSymbolsPictogramServiceOptions
} from "./services/impl/global-symbols-p-service";
import {GridSortingService, GridSortingServiceOptions} from "./services/impl/grid-sorting-service";
import {PointOfInterestService} from "./services/point-of-interest-service";
import {PictogramService} from "./services/pictogram-service";
import {MarkerSortingService} from "./services/marker-sorting-service";
import {debounceAsync} from "./helpers/promise-helpers";

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
	 * Options for configuring the default {@link GridSortingService}.
	 *
	 * @remarks This option is used to define the layout direction of the pictograms when adding them to the DOM.
	 * This is relevant for screen readers and keyboard navigation. On the
	 * @example {lr: "lr", tb: "tb"}
	 */
	gridSortServiceOptions?: GridSortingServiceOptions;

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

	/**
	 * Custom implementation of the {@link MarkerSortingService}.
	 *
	 * Use this field to provide your own service for sorting markers on the map.
	 * If not provided, the plugin will default to an instance of {@link GridSortingService}.
	 *
	 * @remarks The sorting order does not affect the visual position of the markers on the map, but rather the order in
	 * which they are added to the DOM. This is relevant for screen readers and keyboard navigation. One can imagine
	 * use cases where the markers should be sorted in a specific order, e.g. by distance to the user's location.
	 */
	markerSortingService?: MarkerSortingService;

	/**
	 * Debounce interval in milliseconds for updating the map after a move or zoom event.
	 *
	 * @remarks This interval prevents the map from updating too frequently and causing performance issues.
	 * @default 300
	 */
	debounceInterval?: number;
}

export class IndependoMaps {
	private readonly debounceInterval: number;
	private readonly map: L.Map;
	private readonly poiLayerGroup: L.LayerGroup<PictogramMarker>;
	private readonly poiService: PointOfInterestService;
	private readonly pictogramService: PictogramService;
	private readonly markerSortingService: MarkerSortingService;

	constructor(map: L.Map, options?: IndependoMapsOptions) {
		this.debounceInterval = options?.debounceInterval || 300;
		this.map = map;
		this.poiLayerGroup = new L.LayerGroup<PictogramMarker>();

		this.poiService = options?.poiService || new OverpassPOIService(options?.overpassServiceOptions);
		this.pictogramService = options?.pictogramService || new GlobalSymbolsPictogramService(options?.globalSymbolsServiceOptions);
		this.markerSortingService = options?.markerSortingService || new GridSortingService(options?.gridSortServiceOptions);

		// Add the POI layer group to the map
		this.map.addLayer(this.poiLayerGroup);

		const debouncedUpdateMap = debounceAsync(this.updateMap.bind(this), this.debounceInterval);
		this.map.on('moveend zoomend', debouncedUpdateMap);

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

		let layers = (await Promise.all(markerPromises))
			.filter((layer): layer is PictogramMarker => layer !== undefined);

		layers = await this.markerSortingService.sortMarkers(layers, this.map);

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
