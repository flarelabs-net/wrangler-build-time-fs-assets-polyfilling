import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { baseOutputPolyfillsDir } from "./dirs";

const polyfillTemplatesDir = `${__dirname}/../templates/polyfills`;

export async function savePolyfills() {
	await mkdir(`${baseOutputPolyfillsDir}/node`, { recursive: true });

	await copyTemplateFileOver("node/fs.ts");
	await copyTemplateFileOver("node/fs/promises.ts");
}

// Note: I am not using `cp` from `node:fs` just because I think we might want
//       need to tweak the template files on build at some point, for example
//       replacing occurrences of `ASSETS` with the name of the user's assets
//       binding (if different from `ASSETS`)
async function copyTemplateFileOver(templatePath: string): Promise<void> {
	const templateContent = await readFile(
		`${polyfillTemplatesDir}/${templatePath}`,
		"utf8"
	);

	const outputFilePath = `${baseOutputPolyfillsDir}/${templatePath}`;

	await mkdir(dirname(outputFilePath), { recursive: true });
	await writeFile(outputFilePath, templateContent, "utf8");
}
