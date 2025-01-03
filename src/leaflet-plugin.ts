import L, {LatLngBounds, LeafletEvent} from 'leaflet';
import {Pictogram, PictogramMarker, pictogramMarker} from "./pictogram-marker";


const _poiLayerGroup = new L.LayerGroup<PictogramMarker>();

export function initIndependoMaps(map: L.Map) {
	map.addLayer(_poiLayerGroup);
	map.on('moveend zoomend', (event: LeafletEvent) => {
		updateMap(event.target);
	});
	updateMap(map);
}

async function getLayers(bounds: LatLngBounds) {
	// if there are already layers, return them
	if (_poiLayerGroup.getLayers().length > 0) {
		return _poiLayerGroup.getLayers();
	}

	// create three random markers in the bounds
	const markers = [];
	for (let i = 0; i < 3; i++) {
		const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
		const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
		const latlngBounds = L.latLngBounds([lat, lng], [lat + 0.01, lng + 0.01]);
		const pictogram: Pictogram = {
			url: "https://globalsymbols.com/uploads/production/image/imagefile/24245/17_24246_6a48da14-628c-49bd-acda-ea828d4dbe85.jpg",
			text: "Restaurant"
		};

		const marker = pictogramMarker(latlngBounds.getCenter(), {pictogram});
		markers.push(marker);
	}
	return markers;
}

function updateMap(map: L.Map) {
	getLayers(map.getBounds()).then((layers) => {
		_poiLayerGroup.clearLayers();
		layers.forEach(layer => {
			_poiLayerGroup.addLayer(layer);
		});
	});
}
