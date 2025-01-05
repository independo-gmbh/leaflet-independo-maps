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

A demo of the plugin is available [here](https://independo-gmbh.github.io/leaflet-independo-maps/).

## Features

- **[Customizable Styling](#customizing-marker-styles)**: Display POIs as pictograms on a map with options to customize
  the marker's design.
- **[Pluggable Architecture](#customizing-core-services)**: Use your own services for fetching POIs or pictograms via
  the provided service interfaces.
- **[Caching Mechanism](#globalsymbolspictogramserviceoptions)**: Supports both in-memory and local-storage caching for
  enhanced performance.
- **[Accessibility](#globalsymbolspictogramserviceoptions)**: Pictograms include ARIA labels and descriptions if
  provided by the pictogram source. *Note*: The default implementations in the plugin currently support only English for
  the labels and descriptions.
- **[Logical Ordering](#custom-markersortingservice)**: Markers are added to the DOM in a customizable, logical order to
  improve accessibility for screen readers and keyboard navigation.

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

<link rel="stylesheet" href="https://unpkg.com/@independo/leaflet-independo-maps/dist/leaflet-independo-maps.min.css"/>
<script src="https://unpkg.com/@independo/leaflet-independo-maps/dist/leaflet-independo-maps.min.js"></script>
```

### Getting Started

#### **Using npm**

To use the plugin in your project install it via npm:

```bash
npm install @independo/leaflet-independo-maps
```

Then import it and initialize it with a Leaflet map instance:

```typescript
import {initIndependoMaps} from '@independo/leaflet-independo-maps';
import L from 'leaflet';

const map = L.map('map').setView([48.20849, 16.37208], 13);

// Initialize the plugin
const independoMaps = initIndependoMaps(map);
```

Additionally, you need to include the CSS file in your project styles:

```css
@import './node_modules/@independo/leaflet-independo-maps/dist/leaflet-independo-maps.css';
```

#### **Using CDN**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet IndependoMaps Plugin Test</title>
    <!-- Load CSS for Leaflet and IndependoMaps -->
    <link rel="stylesheet"
          href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <link rel="stylesheet"
          href="https://unpkg.com/@independo/leaflet-independo-maps/dist/leaflet-independo-maps.min.css"/>
    <style>
        #map {
            height: 100vh;
        }
    </style>
</head>
<body>
<div id="map"></div>

<!-- Load Leaflet and IndependoMaps JS -->
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<script src="https://unpkg.com/@independo/leaflet-independo-maps"></script>

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

#### Advanced Configuration

You can customize the plugin by passing options to `initIndependoMaps`. For detailed configuration options, see the
[API Documentation](#api-documentation).

Here is an example of how to configure the plugin:

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

### Customizing Marker Styles

The appearance of `PictogramMarker` instances can be customized using CSS. Each marker is constructed with a specific
DOM structure and CSS classes that allow developers to apply custom styles.

#### DOM Structure

A `PictogramMarker` is structured as follows:

```html

<div class="pictogram-marker-container">
    <div class="pictogram-marker-box">
        <div class="pictogram-marker-img-wrapper">
            <img src="pictogram-url.png"/>
        </div>
        <div class="pictogram-marker-label">Label Text</div>
        <div class="pictogram-marker-description">Description Text</div>
    </div>
    <div class="pictogram-marker-pointer"></div>
</div>
```

#### Default CSS Classes

Below is a description of the default CSS classes used by `PictogramMarker`:

| Class                          | Description                                                                                                                                                               |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pictogram-marker-container`   | Root container that aligns the marker.                                                                                                                                    |
| `pictogram-marker-box`         | Wrapper for the marker content, including the image, label, and description.                                                                                              |
| `pictogram-marker-img-wrapper` | Wrapper for the pictogram image, allowing flexible styling.                                                                                                               |
| `pictogram-marker-label`       | Label displaying the `displayText` property of the pictogram.                                                                                                             |
| `pictogram-marker-description` | Optional description for the pictogram displaying the `description` property of a pictogram. Only added if `addDescription` in `PictogramMarkerOptions` is set to `true`. |
| `pictogram-marker-pointer`     | CSS triangle pointing to the marker's geographical position.                                                                                                              |

#### Customization Examples

You can customize the styles by overriding the default classes in your CSS file.

##### Example 1: Change Background and Border

```css
.pictogram-marker-box {
    background-color: #f0f0f0;
    border: 2px solid #ff9900;
    border-radius: 10px;
}
```

##### Example 2: Add Hover Effects

```css
.pictogram-marker-box:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
```

##### Example 3: Resize the Pictogram Image

```css
.pictogram-marker-img-wrapper img {
    max-width: 80px;
    max-height: 80px;
}
```

##### Example 4: Adjust the Pointer

```css
.pictogram-marker-pointer {
    border-top: 10px solid #0078d7; /* Change the pointer color */
}
```

### Customizing Core Services

The `Leaflet.IndependoMaps` plugin provides a pluggable architecture that allows you to customize the behavior of the
plugin by implementing your own services. Below are minimal examples for implementing custom versions of
`PointOfInterestService`, `PictogramService`, and `MarkerSortingService`.

#### Custom `PointOfInterestService`

The `PointOfInterestService` is responsible for fetching points of interest (POIs) within a specified geographic area.
You could for example fetch POIs from
the [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview), [Apple Maps Server API](https://developer.apple.com/documentation/applemapsserverapi/),
you own backend, or any other service.

To implement your own service, create a class that adheres to the `PointOfInterestService` interface.
To use it with the plugin, pass an instance of your custom service to the plugin when initializing it
(see [Using Custom Services](#using-custom-services)).

```typescript
import {PointOfInterest, PointOfInterestQueryOptions, PointOfInterestService} from '@independo/leaflet-independo-maps';
import L from 'leaflet';

class CustomPOIService implements PointOfInterestService {
    async getPointsOfInterest(bounds: L.LatLngBounds, options?: PointOfInterestQueryOptions): Promise<PointOfInterest[]> {
        // Example: Return a static list of POIs
        return [
            {
                id: "1",
                name: "Custom Cafe",
                type: "restaurant",
                latitude: bounds.getCenter().lat,
                longitude: bounds.getCenter().lng,
            },
            {
                id: "2",
                name: "Custom Park",
                type: "park",
                latitude: bounds.getSouthWest().lat,
                longitude: bounds.getSouthWest().lng,
            },
        ];
    }
}
```

#### Custom `PictogramService`

The `PictogramService` is responsible for fetching pictograms for POIs. The plugin calls this service with a POI to
retrieve a corresponding pictogram. It is not mandatory to provide a pictogram for each POI. If no pictogram is
available, the plugin can be configured to either ignore the POI or display a default pictogram.

To implement your own service, create a class that adheres to the `PictogramService` interface.
To use it with the plugin, pass an instance of your custom service to the plugin when initializing it
(see [Using Custom Services](#using-custom-services)).

```typescript
import {Pictogram, PointOfInterest, PictogramService} from '@independo/leaflet-independo-maps';

class CustomPictogramService implements PictogramService {
    async getPictogram(poi: PointOfInterest): Promise<Pictogram | undefined> {
        // Example: Return a static pictogram for all POIs
        return {
            id: poi.id,
            url: "https://example.com/static-pictogram.png",
            displayText: poi.name,
            label: `${poi.type}: ${poi.name}`,
            description: `A pictogram for ${poi.name}`,
        };
    }
}
```

#### Custom `MarkerSortingService`

The `MarkerSortingService` is responsible for bringing the markers in a logical order before they are added to
the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction). This is relevant for
the accessibility of the map, as it ensures that screen readers and keyboard navigation tools can navigate the markers
in a logical order. The default implementation sorts the markers into a 2D grid layout, but for some use cases, a
different sorting algorithm might be more suitable (e.g., sorting by distance to the user's location).

To implement your own service, create a class that adheres to the `MarkerSortingService` interface.
To use it with the plugin, pass an instance of your custom service to the plugin when initializing it
(see [Using Custom Services](#using-custom-services)).

```typescript
import {PictogramMarker, MarkerSortingService} from '@independo/leaflet-independo-maps';
import L from 'leaflet';

class CustomSortingService implements MarkerSortingService {
    async sortMarkers(markers: PictogramMarker[], map: L.Map): Promise<PictogramMarker[]> {
        // Example: Sort markers by latitude, ascending
        return markers.sort((a, b) => a.getLatLng().lat - b.getLatLng().lat);
    }
}
```

#### Using Custom Services

Once you have implemented your custom services, you can integrate them into the plugin by passing them as options when
initializing the plugin:

```typescript
import {initIndependoMaps} from '@independo/leaflet-independo-maps';
import L from 'leaflet';

const map = L.map('map').setView([48.20849, 16.37208], 13);

const options = {
    poiService: new CustomPOIService(),
    pictogramService: new CustomPictogramService(),
    markerSortingService: new CustomSortingService(),
};

const independoMaps = initIndependoMaps(map, options);
```

This allows you to fully customize the behavior of the plugin to suit your specific requirements.

---

### API Documentation

#### `initIndependoMaps(map: L.Map, options?: IndependoMapsOptions): IndependoMaps`

Initializes the plugin and returns an instance of `IndependoMaps`.

| Parameter  | Type                   | Description                                                               |
|------------|------------------------|---------------------------------------------------------------------------|
| `map`      | `L.Map`                | The Leaflet map to attach the plugin to.                                  |
| `options?` | `IndependoMapsOptions` | Optional configuration object for customizing POI and pictogram services. |

#### `IndependoMapsOptions`

Configuration options for the plugin.

| Option                        | Type                                   | Description                                                                               |
|-------------------------------|----------------------------------------|-------------------------------------------------------------------------------------------|
| `poiService`                  | `PointOfInterestService`               | Custom implementation of `PointOfInterestService`. Defaults to `OverpassPOIService`.      |
| `pictogramService`            | `PictogramService`                     | Custom implementation of `PictogramService`. Defaults to `GlobalSymbolsPictogramService`. |
| `overpassServiceOptions`      | `OverpassPOIServiceOptions`            | Configuration for the default Overpass API-based POI service.                             |
| `pictogramMarkerOptions`      | `PictogramMarkerOptions`               | Options for configuring the behavior and interactivity of pictogram markers.              |
| `globalSymbolsServiceOptions` | `GlobalSymbolsPictogramServiceOptions` | Configuration for the default Global Symbols API-based pictogram service.                 |
| `gridSortServiceOptions`      | `GridSortingServiceOptions`            | Configuration for sorting markers into a 2D grid layout.                                  |
| `markerSortingService`        | `MarkerSortingService`                 | Custom implementation of `MarkerSortingService`. Defaults to `GridSortingService`.        |
| `debounceInterval`            | `number`                               | Interval in milliseconds for debouncing map updates after events. Defaults to `300`.      |
| `defaultPictogram`            | `Pictogram`                            | Default pictogram to use if no pictogram is available for a POI.                          |

#### `OverpassPOIServiceOptions`

Configuration for the default Overpass API-based POI service.

| Option            | Type       | Default                                     | Description                                                      |
|-------------------|------------|---------------------------------------------|------------------------------------------------------------------|
| `apiUrl`          | `string`   | `"https://overpass-api.de/api/interpreter"` | Base URL of the Overpass API endpoint.                           |
| `defaultTypes`    | `string[]` | `["shop", "leisure"]`                       | Default POI types to query if none are provided.                 |
| `osmTypes`        | `string[]` | `["node"]`                                  | OpenStreetMap types to query.                                    |
| `defaultLimit`    | `number`   | `25`                                        | Default number of POIs to query if no limit is provided.         |
| `maxRetries`      | `number`   | `3`                                         | Maximum number of retries for rate-limited or failed requests.   |
| `retryDelay`      | `number`   | `1000`                                      | Timeout between retries in milliseconds.                         |
| `timeout`         | `number`   | `25`                                        | Timeout for a single request in seconds.                         |
| `deriveNames`     | `boolean`  | `true`                                      | Whether to derive names for POIs without a name from their type. |
| `filterOutNoName` | `boolean`  | `true`                                      | Whether to filter out POIs without a name.                       |

#### `GlobalSymbolsPictogramServiceOptions`

Configuration for the default Global Symbols API-based pictogram service.

| Option                     | Type                             | Default                                               | Description                                                             |
|----------------------------|----------------------------------|-------------------------------------------------------|-------------------------------------------------------------------------|
| `apiUrl`                   | `string`                         | `"https://globalsymbols.com/api/v1/concepts/suggest"` | Base URL of the Global Symbols API endpoint.                            |
| `symbolSet`                | `string`                         | `"arasaac"`                                           | Symbol set for fetching pictograms (e.g., `"sclera"`, `"blissymbols"`). |
| `includeTypeInDisplayText` | `boolean`                        | `false`                                               | Whether to include the POI type in the display text of the pictogram.   |
| `includeTypeInAriaLabel`   | `boolean`                        | `true`                                                | Whether to include the POI type in the ARIA label of the pictogram.     |
| `cacheStrategy`            | `"in-memory" \| "local-storage"` | `"local-storage"`                                     | Cache strategy to use for storing pictograms.                           |
| `cacheExpiration`          | `number`                         | `604800000`                                           | Cache expiration time in milliseconds (1 week).                         |
| `cachePrefix`              | `string`                         | `"global-symbols-pictogram-service"`                  | Prefix for local-storage cache keys to avoid conflicts.                 |

#### `GridSortingServiceOptions`

Configuration for sorting markers into a 2D grid layout.

| Option         | Type           | Default | Description                                                                        |
|----------------|----------------|---------|------------------------------------------------------------------------------------|
| `lr`           | `"lr" \| "rl"` | `"lr"`  | Layout direction for the x-axis: `"lr"` (left-to-right) or `"rl"` (right-to-left). |
| `tb`           | `"tb" \| "bt"` | `"tb"`  | Layout direction for the y-axis: `"tb"` (top-to-bottom) or `"bt"` (bottom-to-top). |
| `rowThreshold` | `number`       | `64`    | Threshold in pixels to determine row separation.                                   |

#### `PictogramMarkerOptions`

Options for configuring the behavior and interactivity of pictogram markers.

| Option                | Type                                                    | Default     | Description                                                                                          |
|-----------------------|---------------------------------------------------------|-------------|------------------------------------------------------------------------------------------------------|
| `addDescription`      | `boolean`                                               | `false`     | Whether to add the pictogram description to the pictogram marker in case a description is available. |
| `bringToFrontOnClick` | `boolean`                                               | `true`      | Whether to bring the marker to the front when clicked.                                               |
| `bringToFrontOnHover` | `boolean`                                               | `true`      | Whether to bring the marker to the front when hovered.                                               |
| `bringToFrontOnFocus` | `boolean`                                               | `true`      | Whether to bring the marker to the front when focused.                                               |
| `onClick`             | `(pictogram: Pictogram, poi?: PointOfInterest) => void` | `undefined` | Callback function executed when the pictogram marker is clicked.                                     |

---

## Contributing

We welcome contributions to the Leaflet.IndependoMaps plugin! Whether you’re fixing bugs, adding features, or improving
documentation, we’re excited to collaborate with you.

Please review our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## License

This plugin is licensed under the [MIT License](LICENSE).

## Acknowledgements

This plugin was originally developed by [Independo GmbH](https://www.independo.app) with financial support
from [Netidee](https://www.netidee.at/independo-maps).
