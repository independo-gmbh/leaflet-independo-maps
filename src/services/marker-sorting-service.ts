import {PictogramMarker} from "../pictogram-marker";
import L from "leaflet";

/**
 * Abstract interface for a service that sorts markers on a map.
 *
 * The sorting order does not affect the visual position of the markers on the map, but rather the order in which they
 * are added to the DOM. This is relevant for screen readers and keyboard navigation.
 */
export interface MarkerSortingService {

	/**
	 * Sorts the given markers but DOES NOT add them to the map.
	 *
	 * @param markers The markers to sort.
	 * @param map The map is provided for context, e.g. to determine the current map bounds, mapping the coordinates
	 * to layer points, etc.
	 *
	 * @returns A promise resolving to the sorted markers.
	 */
	sortMarkers(markers: PictogramMarker[], map: L.Map): Promise<PictogramMarker[]>;
}
