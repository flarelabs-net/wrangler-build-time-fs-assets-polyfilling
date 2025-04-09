import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { baseOutputPolyfillsDir } from "./dirs";

const polyfillTemplatesDir = `${__dirname}/../templates/polyfills`;

export async function savePolyfills() {
	await mkdir(`${baseOutputPolyfillsDir}/node`, { recursive: true });

	await copyTemplateFileOver("node/fs.ts");
	await copyTemplateFileOver("node/fs/promises.ts");
}

// Note: I am not using `cp` from `node:fs` just because I imagined that we might
//       need to tweak the template files on build... it might actually not be
//       necessary at all
async function copyTemplateFileOver(templatePath: string): Promise<void> {
	const templateContent = await readFile(
		`${polyfillTemplatesDir}/${templatePath}`,
		"utf8"
	);

	const outputFilePath = `${baseOutputPolyfillsDir}/${templatePath}`;

	await mkdir(dirname(outputFilePath), { recursive: true });
	await writeFile(outputFilePath, templateContent, "utf8");
}
