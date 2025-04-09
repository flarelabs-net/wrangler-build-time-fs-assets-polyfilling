import { rm } from "node:fs/promises";
import { getArgs } from "./args";
import { collectAndCopyAssets, validateAssets } from "./assets";
import { baseOutputDir } from "./dirs";
import { savePolyfills } from "./polyfills";
import { generateManifestsIndex } from "./manifests";

// for nodejs.org assets should be './pages' and './snippets'

async function main() {
	const args = getArgs();

	const assetsPaths = args.assets;

	// TODO: check existence of wrangler.toml/json/jsonc (maybe)
	// and validate that there is an assets binding and get its name to use
	// in the polyfills?

	await validateAssets(assetsPaths);

	await rm(baseOutputDir, { force: true, recursive: true });

	for (const assetsPath of assetsPaths) {
		await collectAndCopyAssets(assetsPath);
	}

	await generateManifestsIndex();

	await savePolyfills();
}

main();
