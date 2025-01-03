import L, {LeafletEvent} from 'leaflet';

export function createIndependoMapsLayer(): L.LayerGroup {
	const layer = L.layerGroup();

	layer.on('add', (event: LeafletEvent) => {
		const map = event.target as L.Map;
		if (map) {
			console.log('Independo Maps layer added to map');
		} else {
			console.error('Independo Maps layer could not be added to map');
		}
	});

	return layer;
}
