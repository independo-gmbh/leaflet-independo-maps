import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import {dts} from "rollup-plugin-dts";

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/leaflet-independo-maps.js',
                format: 'umd',
                name: 'LeafletIndependoMaps',
                globals: {
                    leaflet: 'L',
                },
                sourcemap: true
            },
            {
                file: 'dist/leaflet-independo-maps.esm.js',
                format: 'esm',
                name: 'LeafletIndependoMaps',
                sourcemap: true,
                plugins: [terser()],
            },
            {
                file: 'dist/leaflet-independo-maps.min.js',
                format: 'umd',
                name: 'LeafletIndependoMaps',
                globals: {
                    leaflet: 'L',
                },
                sourcemap: true,
                plugins: [terser()],
            },
        ],
        external: ['leaflet'],
        plugins: [
            resolve(),          // Resolve node_modules imports
            commonjs(),         // Convert CommonJS modules to ES modules
            typescript(),       // Transpile TypeScript
        ],
    },
    {
        input: 'dist/types/index.d.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'esm',
        },
        plugins: [dts()],
    }
];
