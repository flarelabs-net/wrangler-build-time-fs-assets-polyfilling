import { rm } from "node:fs/promises";
import { getArgs } from "./args";
import { handleAllAssets } from "./assets";
import { baseOutputDir } from "./dirs";
import { generatePolyfills } from "./polyfills";
import { generateManifestsIndex } from "./manifests";
import { version } from "../package.json";

async function main(): Promise<void> {
	console.log(
		`\x1b[35m🛠️  Setting up Wrangler fs polyfills (v${version})\n\n\x1b[0m`
	);

	const args = getArgs();

	const assetsPaths = args.assets;
	const assetsOutputDir = args.assetsOutputDir;

	// TODO: check existence of wrangler.toml/json/jsonc (maybe)
	// and validate that there is an assets binding and get its name to use
	// in the polyfills?

	await rm(baseOutputDir, { force: true, recursive: true });

	await handleAllAssets(assetsPaths, assetsOutputDir);

	await generateManifestsIndex();

	await generatePolyfills(assetsPaths.length);
}

main();
