import { parseArgs } from "node:util";

export function getArgs(): { assets: string[] } {
	const { values } = parseArgs({
		options: {
			assets: {
				multiple: true,
				short: "a",
				type: "string",
			},
		},
	});

	const assets = values.assets ?? [];

	return { assets };
}
