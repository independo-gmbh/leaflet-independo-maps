import {Pictogram} from "../models/pictogram";
import {PointOfInterest} from "../models/point-of-interest";

/**
 * Abstract interface for a service that provides a {@link Pictogram} for a given  {@link PointOfInterest}.
 */
export interface PictogramService {

	/**
	 * @description Fetches a pictogram for the given point of interest.
	 *
	 * @param poi The {@link PointOfInterest} to fetch a pictogram for.
	 * @returns A promise resolving to a {@link Pictogram} object or `undefined` if no pictogram is found.
	 */
	getPictogram(poi: PointOfInterest): Promise<Pictogram | undefined>;
}
