import L, {LatLngExpression, Map} from "leaflet";
import {Pictogram} from "./models/pictogram";
import {PointOfInterest} from "./models/point-of-interest";

export interface PictogramMarkerOptions {
    /**
     * Whether to add the pictogram description to the pictogram marker in case a description is available.
     *
     * @default false
     */
    addDescription?: boolean;

    /**
     * Whether to bring the pictogram marker to the front when clicked.
     *
     * @default true
     */
    bringToFrontOnClick?: boolean;

    /**
     * Whether to bring the pictogram marker to the front when hovered.
     *
     * @default true
     */
    bringToFrontOnHover?: boolean;

    /**
     * Whether to bring the pictogram marker to the front when focused.
     *
     * @default true
     */
    bringToFrontOnFocus?: boolean;

    /**
     * A callback function that is called when the pictogram marker is clicked.
     *
     * @default undefined
     */
    onClick?: (pictogram: Pictogram, pointOfInterest?: PointOfInterest) => void;
}

/**
 * A custom Leaflet layer that displays a pictogram marker at a specified geographical location.
 *
 * This marker supports accessibility features, customizable interactions, and flexible styling.
 * It is designed to be used with the Leaflet library and integrates easily into any Leaflet map.
 */
export class PictogramMarker extends L.Layer {
    private readonly addDescription: boolean;
    private readonly bringToFrontOnClick: boolean;
    private readonly bringToFrontOnHover: boolean;
    private readonly bringToFrontOnFocus: boolean;
    private readonly onClick: ((pictogram: Pictogram, pointOfInterest?: PointOfInterest) => void) | undefined;

    private readonly _latlng: L.LatLng;
    private readonly _pictogram: Pictogram;
    private readonly _pointOfInterest: PointOfInterest | undefined;

    private container?: HTMLDivElement;
    private box?: HTMLDivElement;
    private map: Map | null = null;

    getLatLng(): L.LatLng {
        return this._latlng;
    }

    /**
     * Constructs a new instance of the `PictogramMarker` class.
     *
     * @param latlng - The geographical coordinates where the marker should be placed.
     * @param pictogram - The pictogram object containing the display data (e.g., URL, label, description).
     * @param pointOfInterest - (Optional) The associated point of interest for this marker.
     * @param options - (Optional) Configuration options for the marker's behavior and interactivity.
     *
     * @example
     * ```typescript
     * const latlng = L.latLng(48.20849, 16.37208);
     * const pictogram = {
     *     id: '1',
     *     url: 'https://example.com/pictogram.png',
     *     displayText: 'Restaurant',
     *     description: 'A fine dining restaurant serving local cuisine.'
     * };
     *
     * const options = {
     *     addDescription: true,
     *     bringToFrontOnClick: true,
     *     onClick: (pictogram) => {
     *         console.log('Pictogram clicked:', pictogram);
     *     }
     * };
     *
     * const marker = new PictogramMarker(latlng, pictogram, undefined, options);
     * marker.addTo(map);
     * ```
     */
    constructor(latlng: LatLngExpression,
                pictogram: Pictogram,
                pointOfInterest?: PointOfInterest,
                options?: PictogramMarkerOptions) {
        super();
        this._latlng = L.latLng(latlng);
        this._pictogram = pictogram;
        this._pointOfInterest = pointOfInterest;
        this.addDescription = options?.addDescription ?? false;
        this.bringToFrontOnClick = options?.bringToFrontOnClick ?? true;
        this.bringToFrontOnHover = options?.bringToFrontOnHover ?? true;
        this.bringToFrontOnFocus = options?.bringToFrontOnFocus ?? true;
        this.onClick = options?.onClick;
    }

    onAdd(map: Map): this {
        this.map = map;

        this.container = L.DomUtil.create("div", "pictogram-marker-container") as HTMLDivElement;
        this.container.style.position = "absolute";
        this.container.style.transform = "translate(-50%, -100%)";

        this.box = L.DomUtil.create("div", "pictogram-marker-box", this.container);

        const imgWrapper = L.DomUtil.create("div", "pictogram-marker-img-wrapper", this.box);
        const img = document.createElement("img");
        img.src = this._pictogram.url;
        // Accessible description is in the parent container
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.setAttribute("role", "presentation");
        imgWrapper.appendChild(img);

        const label = L.DomUtil.create("div", "pictogram-marker-label", this.box);
        label.textContent = this._pictogram.displayText;

        if (this.addDescription && this._pictogram.description) {
            const description = L.DomUtil.create("div", "pictogram-marker-description", this.box);
            description.textContent = this._pictogram.description;
            const id = `pmd-${Math.random().toString(36).substring(7)}`;
            description.id = id;
            this.box.setAttribute("aria-describedby", id);
            description.setAttribute("aria-hidden", "true");
        }

        const pointer = L.DomUtil.create("div", "pictogram-marker-pointer", this.container);

        // Add event listeners
        if (this.onClick) {
            this.box.addEventListener("click", () => this.onClick?.(this._pictogram, this._pointOfInterest));
            this.box.setAttribute("role", "button");
            this.box.tabIndex = 0;
        }

        // Add the container to the map's overlay pane
        map.getPanes().overlayPane.appendChild(this.container);

        // Update the position of the container
        this.updatePosition();
        map.on("zoomend moveend", this.updatePosition, this);

        this.setupInteractions();

        return this;
    }

    onRemove(map: Map): this {
        if (this.container) {
            map.getPanes().overlayPane.removeChild(this.container);
        }
        map.off("zoomend moveend", this.updatePosition, this);

        return this;
    }

    private updatePosition(): void {
        if (!this.map || !this.container) return;
        const position = this.map.latLngToLayerPoint(this._latlng);
        this.container.style.left = `${position.x}px`;
        this.container.style.top = `${position.y}px`;
    }

    private setupInteractions(): void {
        if (!this.container) return;
        if (!this.box) return;

        const container = this.container;
        const box = this.box;

        if (this.bringToFrontOnClick) {
            container.addEventListener("click", () => this.toggleInFront(container));
            container.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.toggleInFront(container);
                }
            });
        }

        if (this.bringToFrontOnHover) {
            container.addEventListener("mouseenter", () => this.toggleInFront(container));
            container.addEventListener("mouseleave", () => this.toggleInFront(container));
        }

        if (this.bringToFrontOnFocus) {
            box.addEventListener("focus", () => this.toggleInFront(container));
            box.addEventListener("blur", () => this.toggleInFront(container));
        }

        if (this.onClick) {
            container.addEventListener("click", () => this.onClick?.(this._pictogram, this._pointOfInterest));
            container.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.onClick?.(this._pictogram, this._pointOfInterest);
                }
            });
        }
    }

    private toggleInFront(container: HTMLDivElement): void {
        if (container.style.zIndex === "1000") {
            container.style.zIndex = "auto";
        } else {
            container.style.zIndex = "1000";
        }
    }
}

export function pictogramMarker(latlng: LatLngExpression, pictogram: Pictogram, pointOfInterest?: PointOfInterest, options?: PictogramMarkerOptions): PictogramMarker {
    return new PictogramMarker(latlng, pictogram, pointOfInterest, options);
}
