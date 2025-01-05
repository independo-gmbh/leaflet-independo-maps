import L, {LatLngExpression, Map} from "leaflet";
import {Pictogram} from "./models/pictogram";
import {PointOfInterest} from "./models/point-of-interest";

export interface PictogramMarkerOptions {
    /**
     * Whether to add an aria description to the pictogram marker.
     *
     * @default true
     */
    addAriaDescription?: boolean;

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
 * A custom Leaflet layer that displays a pictogram at a given latlng.
 */
export class PictogramMarker extends L.Layer {
    private readonly addAriaDescription: boolean;
    private readonly bringToFrontOnClick: boolean;
    private readonly bringToFrontOnHover: boolean;
    private readonly bringToFrontOnFocus: boolean;
    private readonly onClick: ((pictogram: Pictogram, pointOfInterest?: PointOfInterest) => void) | undefined;

    private readonly _latlng: L.LatLng;
    private readonly _pictogram: Pictogram;
    private readonly _pointOfInterest: PointOfInterest | undefined;

    private container?: HTMLDivElement;
    private map: Map | null = null;

    getLatLng(): L.LatLng {
        return this._latlng;
    }

    constructor(latlng: LatLngExpression, pictogram: Pictogram, pointOfInterest?: PointOfInterest, options?: PictogramMarkerOptions) {
        super();
        this._latlng = L.latLng(latlng);
        this._pictogram = pictogram;
        this._pointOfInterest = pointOfInterest;
        this.addAriaDescription = options?.addAriaDescription ?? true;
        this.bringToFrontOnClick = options?.bringToFrontOnClick ?? true;
        this.bringToFrontOnHover = options?.bringToFrontOnHover ?? true;
        this.bringToFrontOnFocus = options?.bringToFrontOnFocus ?? true;
        this.onClick = options?.onClick;
    }

    onAdd(map: Map): this {
        this.map = map;

        // Create the container div
        this.container = L.DomUtil.create("div", "pictogram-wrapper") as HTMLDivElement;
        this.container.style.position = "absolute";

        // Create the black-bordered box
        const box = document.createElement("div");
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", `${this._pictogram.ariaLabel || this._pictogram.displayText}`);
        if (this.addAriaDescription && this._pictogram.description) {
            // add a hidden span with the description, generate a random id and add aria-describedby to the box
            const description = document.createElement("span");
            description.textContent = this._pictogram.description;
            description.style.display = "none";
            const id = Math.random().toString(36).substring(7);
            description.id = id;
            box.setAttribute("aria-describedby", id);
            this.container.appendChild(description);
        }
        box.setAttribute("tabindex", "0");
        box.style.display = "flex";
        box.style.flexDirection = "column";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.padding = "10px"; // Add padding around the content
        box.style.border = "3px solid black"; // Black border
        box.style.borderRadius = "5px"; // Rounded corners
        box.style.background = "white"; // White background
        box.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)"; // Add shadow for depth
        if (this.onClick) {
            box.style.cursor = "pointer";
            box.setAttribute("role", "button");
            box.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.onClick?.(this._pictogram, this._pointOfInterest);
                }
            });
            box.addEventListener("click", () => this.onClick?.(this._pictogram, this._pointOfInterest));
        }

        // Create the image element
        const img = document.createElement("img");
        img.src = this._pictogram.url;
        // Ignore by assistive technologies as the relevant information is in the box
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";

        // Create the label for the display text
        const label = document.createElement("div");
        label.textContent = this._pictogram.displayText;
        label.style.fontSize = "12px";
        label.style.marginTop = "5px";
        label.style.textAlign = "center";
        // Ignore by assistive technologies as the relevant information is in the box
        label.setAttribute("aria-hidden", "true");

        // Add the image and label to the box
        box.appendChild(img);
        box.appendChild(label);

        // Create the pointy border (CSS triangle)
        const pointer = document.createElement("div");
        pointer.style.position = "absolute";
        pointer.style.width = "0";
        pointer.style.height = "0";
        pointer.style.borderLeft = "10px solid transparent";
        pointer.style.borderRight = "10px solid transparent";
        pointer.style.borderTop = "10px solid black";
        pointer.style.top = "100%"; // Place the pointer below the box
        pointer.style.left = "50%";
        pointer.style.transform = "translateX(-50%)";

        // Wrap the box and pointer
        this.container.appendChild(box);
        this.container.appendChild(pointer);

        // Add the container to the map's overlay pane
        map.getPanes().overlayPane.appendChild(this.container);

        // Update the position of the container
        this.updatePosition();
        map.on("zoomend moveend", this.updatePosition, this);

        if (this.bringToFrontOnClick) {
            this.container.addEventListener("click", () => this.toggleInFront(this.container));
            this.container.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.toggleInFront(this.container);
                }
            });
        }

        if (this.bringToFrontOnHover) {
            this.container.addEventListener("mouseenter", () => this.toggleInFront(this.container));
            this.container.addEventListener("mouseleave", () => this.toggleInFront(this.container));
        }

        if (this.bringToFrontOnFocus) {
            box.addEventListener("focus", () => this.toggleInFront(this.container));
            box.addEventListener("blur", () => this.toggleInFront(this.container));
        }

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

        // Convert latlng to pixel coordinates
        const position = this.map.latLngToLayerPoint(this._latlng);
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        // Position the container so that the pointer's tip points to the latlng
        this.container.style.left = `${position.x - containerWidth / 2}px`;
        this.container.style.top = `${position.y - containerHeight}px`;
    }

    private toggleInFront(box: HTMLDivElement | undefined): void {
        if (box) {
            if (box.style.zIndex === "1000") {
                box.style.zIndex = "auto";
            } else {
                box.style.zIndex = "1000";
            }
        }
    }
}

export function pictogramMarker(latlng: LatLngExpression, pictogram: Pictogram, pointOfInterest?: PointOfInterest, options?: PictogramMarkerOptions): PictogramMarker {
    return new PictogramMarker(latlng, pictogram, pointOfInterest, options);
}
