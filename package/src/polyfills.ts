import { mkdir, readFile, writeFile } from "node:fs/promises";
import { baseOutputPolyfillsDir } from "./dirs";

export async function savePolyfills() {
	await mkdir(`${baseOutputPolyfillsDir}/node`, { recursive: true });

	const polyfillTemplatesDir = `${__dirname}/../templates/polyfills`;

	const fsTemplateContent = await readFile(
		`${polyfillTemplatesDir}/node/fs.ts`,
		"utf8"
	);

	await writeFile(
		`${baseOutputPolyfillsDir}/node/fs.ts`,
		fsTemplateContent,
		"utf8"
	);
}
