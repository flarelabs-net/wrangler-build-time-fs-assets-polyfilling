import { parseArgs } from "node:util";

/**
 * Gets the CLI arguments passed to the bin command.
 * This function also performs validation and can throw if some arguments are invalid.
 *
 * @returns the arguments
 */
export function getArgs(): {
	assets: string[];
	assetsOutputDir: string | null;
} {
	const { values } = parseArgs({
		options: {
			assets: {
				multiple: true,
				short: "a",
				type: "string",
			},
			"assets-output-dir": {
				multiple: false,
				short: "o",
				type: "string",
			},
		},
	});

	const assets = values.assets ?? [];

	if (assets.length > 1) {
		if (!values["assets-output-dir"]) {
			throw new Error(
				"Multiple assets have been requested, in that case an assetsOutputDir needs to be specified too (with --assets-output-dir|-o)"
			);
		}
	}

	return { assets, assetsOutputDir: values["assets-output-dir"] ?? null };
}
