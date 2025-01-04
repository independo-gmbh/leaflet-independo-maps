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

    /**
     * @description Cache strategy: "in-memory" (in-memory caching) or "local-storage" (persistent caching).
     * @default "local-storage"
     */
    cacheStrategy?: "in-memory" | "local-storage";

    /**
     * @description Cache expiration time in milliseconds.
     * @default 604800000 (1 week)
     */
    cacheExpiration?: number;

    /**
     * @description Cache prefix for the local storage cache.
     * @default "global-symbols-pictogram-service"
     * @remarks This is used to avoid conflicts with other local storage items.
     */
    cachePrefix?: string;
}

interface CachedResponse {
    timestamp: number;
    data: any;
}

export class GlobalSymbolsPictogramService implements PictogramService {

    private readonly apiUrl: string;
    private readonly symbolSet: string;
    private readonly includeTypeInDisplayText: boolean;
    private readonly includeTypeInLabel: boolean;
    private readonly cacheStrategy: "in-memory" | "local-storage";
    private readonly cacheExpiration: number;
    private readonly cachePrefix: string;

    private memoryCache: Map<string, CachedResponse>;

    constructor(options?: GlobalSymbolsPictogramServiceOptions) {
        this.apiUrl = options?.apiUrl || "https://globalsymbols.com/api/v1/labels/search";
        this.symbolSet = options?.symbolSet || "arasaac";
        this.includeTypeInDisplayText = options?.includeTypeInDisplayText || false;
        this.includeTypeInLabel = options?.includeTypeInAriaLabel ?? true;
        this.cacheStrategy = options?.cacheStrategy || "local-storage";
        this.cacheExpiration = options?.cacheExpiration || 604800000;
        this.cachePrefix = options?.cachePrefix || "global-symbols-pictogram-service";
        this.memoryCache = new Map<string, CachedResponse>();

        if (this.cacheStrategy === "local-storage") {
            this.cleanupLocalStorage();
        }
    }

    /** @inheritDoc */
    public async getPictogram(poi: PointOfInterest): Promise<Pictogram | undefined> {
        const searchTerm = poi.type;
        const cacheKey = this.getCacheKey(searchTerm);

        const cachedResponse = this.getFromCache(cacheKey);
        if (cachedResponse) {
            return this.constructPictogram(poi, cachedResponse);
        }

        const queryParams = new URLSearchParams({
            query: searchTerm,
            language: "eng",
            language_iso_format: "639-3",
            limit: "1",
            symbolSet: this.symbolSet,
        });

        try {
            const response = await fetch(`${this.apiUrl}?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch pictogram: ${response.statusText}`);
            }

            const data = await response.json();
            this.saveToCache(cacheKey, data);

            return this.constructPictogram(poi, data);
        } catch (error) {
            console.error(`Error fetching pictogram for POI: ${searchTerm}`, error);
            throw error;
        }
    }

    private constructPictogram(poi: PointOfInterest, data: any): Pictogram | undefined {
        if (data.length > 0) {
            return {
                id: data[0].id.toString(),
                url: data[0].picto.image_url,
                displayText: this.includeTypeInDisplayText ? `${nameify(poi.type)}: ${poi.name}` : poi.name,
                label: this.includeTypeInLabel ? `${nameify(poi.type)}: ${poi.name}` : poi.name,
                description: data[0].description,
                metadata: data[0],
            };
        } else {
            return undefined;
        }
    }

    private getCacheKey(searchTerm: string): string {
        return `${this.cachePrefix}:${this.symbolSet}:${searchTerm}`;
    }

    private getFromCache(key: string): any | undefined {
        if (this.cacheStrategy === "in-memory") {
            const cached = this.memoryCache.get(key);
            if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
                return cached.data;
            }
            this.memoryCache.delete(key);
        } else if (this.cacheStrategy === "local-storage") {
            const cachedString = localStorage.getItem(key);
            if (cachedString) {
                const cached: CachedResponse = JSON.parse(cachedString);
                if (Date.now() - cached.timestamp < this.cacheExpiration) {
                    return cached.data;
                }
                localStorage.removeItem(key); // Remove expired item immediately
            }
        }
        return undefined;
    }

    private saveToCache(key: string, data: any): void {
        const cachedResponse: CachedResponse = {timestamp: Date.now(), data};
        if (this.cacheStrategy === "in-memory") {
            this.memoryCache.set(key, cachedResponse);
        } else if (this.cacheStrategy === "local-storage") {
            localStorage.setItem(key, JSON.stringify(cachedResponse));
        }
    }

    /**
     * Cleans up expired items in `localStorage`.
     *
     * This method iterates over all keys in `localStorage` and removes any expired cache entries.
     */
    private cleanupLocalStorage(): void {
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (!key.startsWith(this.cachePrefix)) continue;

            const cachedString = localStorage.getItem(key);
            if (cachedString) {
                const cached: CachedResponse = JSON.parse(cachedString);
                if (Date.now() - cached.timestamp >= this.cacheExpiration) {
                    keysToRemove.push(key);
                }
            }
        }

        // Remove all expired keys after iteration to avoid modifying the storage while iterating
        keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
}
