import {Pictogram} from "../../models/pictogram";
import {PointOfInterest} from "../../models/point-of-interest";
import {PictogramService} from "../pictogram-service";
import {nameify} from "../../helpers/string-helpers";

/**
 * @description Options for configuring the GlobalSymbolsPictogramService.
 * @see https://globalsymbols.com/api/docs Global Symbols API documentation
 */
export interface GlobalSymbolsPictogramServiceOptions {
	/**
	 * @description The base URL of the Global Symbols API endpoint.
	 * @default "https://globalsymbols.com/api/v1/concepts/suggest".
	 */
	apiUrl?: string;

	/**
	 * @description The symbol set the pictogram should be fetched from.
	 * @default "arasaac"
	 * @remarks Examples: `"arasaac"`, `"sclera"`, `"blissymbols"`, etc.
	 * @see https://globalsymbols.com/api/docs Global Symbols API documentation
	 * @see https://globalsymbols.com/api/v1/symbolsets GET all available symbol sets
	 */
	symbolSet?: string;

	/**
	 * @description Include the type of the point of interest in the display text of the pictogram.
	 * @default false
	 */
	includeTypeInDisplayText?: boolean;

	/**
	 * @description Include the type of the point of interest in the aria label of the pictogram.
	 * @default true
	 */
	includeTypeInAriaLabel?: boolean;
}

/**
 * Implementation of the PictogramService interface using the Global Symbols API.
 */
export class GlobalSymbolsPictogramService implements PictogramService {
	private readonly apiUrl: string;
	private readonly symbolSet: string;
	private readonly includeTypeInDisplayText: boolean;
	private readonly includeTypeInAriaLabel: boolean;

	constructor(options?: GlobalSymbolsPictogramServiceOptions) {
		this.apiUrl = options?.apiUrl || "https://globalsymbols.com/api/v1/labels/search";
		this.symbolSet = options?.symbolSet || "arasaac";
		this.includeTypeInDisplayText = options?.includeTypeInDisplayText || false;
		this.includeTypeInAriaLabel = options?.includeTypeInAriaLabel ?? true;
	}

	/** @inheritDoc */
	public async getPictogram(poi: PointOfInterest): Promise<Pictogram | undefined> {
		// TODO: add caching

		const searchTerm = poi.type;
		const queryParams = new URLSearchParams({
			query: searchTerm,
			language: "eng",
			language_iso_format: "639-3",
			limit: "1",
			symbolSet: this.symbolSet
		});

		try {
			const response = await fetch(`${this.apiUrl}?${queryParams.toString()}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch pictogram: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.length > 0) {
				return {
					id: data[0].id.toString(),
					url: data[0].picto.image_url,
					displayText: this.includeTypeInDisplayText ? `${nameify(poi.type)}: ${poi.name}` : poi.name,
					label: this.includeTypeInAriaLabel ? `${nameify(poi.type)}: ${poi.name}` : poi.name,
					description: data[0].description,
					metadata: data[0]
				};
			} else {
				return undefined;
			}
		} catch (error) {
			console.error(`Error fetching pictogram for POI: ${searchTerm}`, error);
			throw error;
		}
	}
}
