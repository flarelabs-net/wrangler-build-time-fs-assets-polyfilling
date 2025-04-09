import { rm } from "node:fs/promises";
import { getArgs } from "./args";
import { collectAndCopyAllAssets, validateAssets } from "./assets";
import { baseOutputDir } from "./dirs";
import { savePolyfills } from "./polyfills";
import { generateManifestsIndex } from "./manifests";
import { version } from "../package.json";

// for nodejs.org assets should be './pages' and './snippets'

async function main() {
	console.log(
		`\x1b[35m🛠️  Setting up Wrangler fs polyfills (v${version})\n\n\x1b[0m`
	);

	const args = getArgs();

	const assetsPaths = args.assets;
	const assetsOutputDir = args.assetsOutputDir;

	// TODO: check existence of wrangler.toml/json/jsonc (maybe)
	// and validate that there is an assets binding and get its name to use
	// in the polyfills?

	await validateAssets(assetsPaths);

	await rm(baseOutputDir, { force: true, recursive: true });

	await collectAndCopyAllAssets(assetsPaths, assetsOutputDir);

	await generateManifestsIndex();

	await savePolyfills(assetsPaths.length);
}

main();
