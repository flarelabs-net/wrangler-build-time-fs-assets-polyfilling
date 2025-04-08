import { mkdir, readFile, writeFile } from "node:fs/promises";
import { baseOutputPolyfillsDir } from "./dirs";

export async function savePolyfills() {
	console.log(`\x1b[32m ${__filename} \x1b[0m`);

	await mkdir(`${baseOutputPolyfillsDir}/node`, { recursive: true });

	const polyfillTemplatesDir = `${__dirname}/../templates/polyfills`;

	const fsTemplateContent = await readFile(
		`${polyfillTemplatesDir}/node/fs.ts`,
		"utf8"
	);
	// console.log(`\x1b[35m${fs}\x1b[0m`);

	// baseOutputPolyfillsDir
	await writeFile(
		`${baseOutputPolyfillsDir}/node/fs.ts`,
		fsTemplateContent,
		"utf8"
	);
}
