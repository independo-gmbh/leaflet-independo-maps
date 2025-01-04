<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2025" alt="Maintenance Badge: until 2025" />
  <a href="https://www.npmjs.com/package/@independo/leaflet-independo-maps"><img src="https://img.shields.io/npm/l/@independo/leaflet-independo-maps" alt="License Badge: MIT" /></a>
<br>
  <a href="https://www.npmjs.com/package/@independo/leaflet-independo-maps"><img src="https://img.shields.io/npm/dw/@independo/leaflet-independo-maps" alt="Downloads Badge" role="presentation" /></a>
  <a href="https://www.npmjs.com/package/@independo/leaflet-independo-maps"><img src="https://img.shields.io/npm/v/@independo/leaflet-independo-maps" alt="Version Badge" role="presentation" /></a>
</p>

# Leaflet.IndependoMaps

A [LeafletJS](http://leafletjs.com/) plugin for displaying points of interest (POIs) as pictograms on a map.

This plugin enables developers to overlay a custom layer of POIs onto a Leaflet map, displaying them as easily
recognizable pictograms sourced from external services like
the [Global Symbols API](https://globalsymbols.com/api/docs). It is designed to be lightweight, customizable, and
developer-friendly.

---

## Features

- **Customizable Layers**: Display POIs as pictograms on a map with options to customize the marker's design.
- **Pluggable Architecture**: Use your own services for fetching POIs or pictograms via the provided service interfaces.
- **Caching Mechanism**: Supports both in-memory and local-storage caching for enhanced performance.
- **Accessibility**: Pictograms include ARIA labels and descriptions if provided by the pictogram source. *Note*: The
  default implementations in the plugin currently support only English for the ARIA labels and descriptions.
- **Logical Ordering**: Markers are added to the DOM in a customizable, logical order to improve accessibility for
  screen readers and keyboard navigation.

---

## Usage

### Prerequisites

To use this plugin, you need:

- A working installation of [LeafletJS](http://leafletjs.com/) (version 1.9.4 or higher recommended).
- An API key for external services (optional, depending on your configuration).

### Installation

#### **Via npm**

You can install the plugin via npm:

```bash
npm install @independo/leaflet-independo-maps
```

#### **Via CDN**

Alternatively, you can include the plugin directly in your HTML file using a CDN:

```html

<script src="https://unpkg.com/@independo/leaflet-independo-maps@latest"></script>
```

---

### Getting Started

#### **Using npm**

```typescript
import {initIndependoMaps} from '@independo/leaflet-independo-maps';
import L from 'leaflet';

const map = L.map('map').setView([48.20849, 16.37208], 13);

// Initialize the plugin
const independoMaps = initIndependoMaps(map);
```

#### **Using CDN**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet IndependoMaps Plugin Test</title>
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <style>
        #map {
            height: 100vh;
        }
    </style>
</head>
<body>
<div id="map"></div>

<!-- Load Leaflet and IndependoMaps -->
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<script src="https://unpkg.com/@independo/leaflet-independo-maps@latest"></script>

<script>
    const map = L.map('map').setView([48.20849, 16.37208], 15);
    // Add a tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    LeafletIndependoMaps.initIndependoMaps(map);
</script>
</body>
</html>
```

---

#### Advanced Configuration

You can customize the plugin by passing options to `initIndependoMaps`. For example:

```typescript
import {initIndependoMaps} from '@independo/leaflet-independo-maps';
import L from 'leaflet';

const map = L.map('map').setView([48.20849, 16.37208], 13);

const options = {
  overpassServiceOptions: {
    apiUrl: "https://custom-overpass-api.com",
    defaultLimit: 50,
    defaultTypes: ["amenity", "shop", "tourism"]
  },
  globalSymbolsServiceOptions: {
    symbolSet: "sclera",
    includeTypeInDisplayText: true
  },
  gridSortServiceOptions: {
    lr: "lr",
    tb: "tb",
    rowThreshold: 64
  },
  pictogramMarkerOptions: {
    onClick: (pictogram, pointOfInterest) => {
      console.log(pictogram, pointOfInterest);
    }
  }
};

const independoMaps = initIndependoMaps(map, options);
```

---

### API Documentation

#### `initIndependoMaps(map: L.Map, options?: IndependoMapsOptions): IndependoMaps`

Initializes the plugin and returns an instance of `IndependoMaps`.

- **`map`**: The Leaflet map to attach the plugin to.
- **`options`** (optional): An `IndependoMapsOptions` object for configuring POI and pictogram services.

#### `IndependoMapsOptions`

- `poiService`: A custom implementation of `PointOfInterestService`.
- `pictogramService`: A custom implementation of `PictogramService`.
- `overpassServiceOptions`: Configuration for the
  default [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)-based POI service.
- `pictogramMarkerOptions`: Configuration for the pictogram markers.
- `globalSymbolsServiceOptions`: Configuration for the default [Global Symbols API](https://globalsymbols.com/api/docs)
  -based pictogram service.
- `gridSortServiceOptions`: Configuration for sorting markers into a 2D grid layout.
- `markerSortingService`: A custom implementation of `MarkerSortingService`.
- `debounceInterval`: Interval in milliseconds for debouncing map updates after events.

---

## Contributing

We welcome contributions to the Leaflet.IndependoMaps plugin! Whether you’re fixing bugs, adding features, or improving
documentation, we’re excited to collaborate with you.

Please review our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## License

This plugin is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

This plugin was originally developed by [Independo GmbH](https://www.independo.app) with financial support
from [Netidee](https://www.netidee.at/independo-maps).
