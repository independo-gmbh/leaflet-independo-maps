import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/leaflet-independo-maps.js',	// Output file
			format: 'umd',                         	// UMD module format
			name: 'LeafletIndependoMaps',          	// UMD global variable name
			globals: {
				leaflet: 'L'                       	// Treat Leaflet as a global variable
			}
		}
	],
	external: ['leaflet'], 							// Leaflet is an external dependency
	plugins: [typescript()]
};
