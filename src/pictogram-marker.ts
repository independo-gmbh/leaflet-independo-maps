import L, {LatLngExpression, Map} from "leaflet";
import {Pictogram} from "./models/pictogram";
import {PointOfInterest} from "./models/point-of-interest";

export interface PictogramMarkerOptions {
	/**
	 * The {@link Pictogram} to display.
	 */
	pictogram: Pictogram;

	/**
	 * The {@link PointOfInterest} that the pictogram is associated with.
	 */
	pointOfInterest?: PointOfInterest;
}

/**
 * A custom Leaflet layer that displays a pictogram at a given latlng.
 */
export class PictogramMarker extends L.Layer {
	private readonly latlng: L.LatLng;
	private readonly _options: PictogramMarkerOptions;
	private container: HTMLDivElement | null = null;
	private map: Map | null = null;

	constructor(latlng: LatLngExpression, options: PictogramMarkerOptions) {
		super();
		this.latlng = L.latLng(latlng);
		this._options = options;
	}

	onAdd(map: Map): this {
		this.map = map;

		// Create the container div
		this.container = L.DomUtil.create("div", "pictogram-wrapper") as HTMLDivElement;
		this.container.style.position = "absolute";

		// Create the black-bordered box
		const box = document.createElement("div");
		box.setAttribute("role", "group");
		box.setAttribute("aria-label", `${this._options.pictogram.label || this._options.pictogram.displayText}`);
		if (this._options.pictogram.description) {
			// add a hidden span with the description, generate a random id and add aria-describedby to the box
			const description = document.createElement("span");
			description.textContent = this._options.pictogram.description;
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

		// Create the image element
		const img = document.createElement("img");
		img.src = this._options.pictogram.url;
		img.alt = ""; // Empty alt attribute for decorative image
		img.setAttribute("aria-hidden", "true"); // Ignore by assistive technologies
		img.style.maxWidth = "100px"; // Adjust as needed
		img.style.maxHeight = "100px"; // Adjust as needed

		// Create the label
		const label = document.createElement("div");
		label.textContent = this._options.pictogram.displayText;
		label.style.fontSize = "12px";
		label.style.marginTop = "5px";
		label.style.textAlign = "center";
		label.setAttribute("aria-hidden", "true"); // Ignore by assistive technologies

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

		// TODO: bring to front on click or hover

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
		const position = this.map.latLngToLayerPoint(this.latlng);
		const containerWidth = this.container.offsetWidth;
		const containerHeight = this.container.offsetHeight;

		// Position the container so that the pointer's tip points to the latlng
		this.container.style.left = `${position.x - containerWidth / 2}px`;
		this.container.style.top = `${position.y - containerHeight}px`;
	}
}

// Factory function for easier instantiation
export function pictogramMarker(latlng: LatLngExpression, options: PictogramMarkerOptions): PictogramMarker {
	return new PictogramMarker(latlng, options);
}
