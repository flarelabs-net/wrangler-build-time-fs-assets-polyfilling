import { readFile, writeFile } from "fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	dts: true,
	format: ["cjs"],
	platform: "node",
	external: ["esbuild"],
	onSuccess: async () => {
		const distIndex = await readFile("dist/index.js", "utf8");
		await writeFile(
			"dist/index.js",
			["#!/usr/bin/env node\n", distIndex].join("\n"),
			"utf8"
		);
	},
});
