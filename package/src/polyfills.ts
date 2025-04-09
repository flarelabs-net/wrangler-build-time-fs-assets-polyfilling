import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { baseOutputPolyfillsDir } from "./dirs";

const polyfillTemplatesDir = `${__dirname}/../templates/polyfills`;

export async function savePolyfills(numberOfAssetsDirs: number) {
	await mkdir(`${baseOutputPolyfillsDir}/node`, { recursive: true });

	await copyTemplateFileOver("node/fs.ts");
	await copyTemplateFileOver("node/fs/promises.ts", (fileContent) => {
		// Note: we should update occurrences of `ASSETS` with the name of the user's assets
		//       binding (if different from `ASSETS`) (if we end up parsing
		//       the user's wrangler config file)
		if (numberOfAssetsDirs > 1) {
			return fileContent.replace(
				"const addSlashPrefix = true;",
				"const addSlashPrefix = false;"
			);
		}
		return fileContent;
	});
}

async function copyTemplateFileOver(
	templatePath: string,
	updateContent: (fileContent: string) => string = (str) => str
): Promise<void> {
	const templateContent = await readFile(
		`${polyfillTemplatesDir}/${templatePath}`,
		"utf8"
	);

	const outputFilePath = `${baseOutputPolyfillsDir}/${templatePath}`;

	await mkdir(dirname(outputFilePath), { recursive: true });
	const updatedTemplateContent = updateContent(templateContent);
	await writeFile(outputFilePath, updatedTemplateContent, "utf8");
}
