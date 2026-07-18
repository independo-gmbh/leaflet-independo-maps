import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
	{
		ignores: ["dist/", "node_modules/", "demo/", "coverage/"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
		rules: {
			// External API responses (Overpass, Global Symbols) and metadata
			// containers are intentionally dynamic. Surface `any` as a warning
			// so it can be tightened incrementally without blocking the build.
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
	// Disable ESLint rules that conflict with Prettier formatting.
	prettier,
);
