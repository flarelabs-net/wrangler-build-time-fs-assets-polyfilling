import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { baseOutputPolyfillsDir } from "./dirs";

const polyfillTemplatesDir = `${__dirname}/../templates/polyfills`;

/**
 * Generates the polyfills in the polyfills output directory.
 *
 * @param numberOfAssetsDirs the number of assets directories requested by the user
 */
export async function generatePolyfills(
	numberOfAssetsDirs: number
): Promise<void> {
	await mkdir(`${baseOutputPolyfillsDir}/node`, { recursive: true });

	await copyTemplatePolyfill("node/fs.ts");
	await copyTemplatePolyfill("node/fs/promises.ts", (fileContent) => {
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

/**
 * Copies a template file (from this package's templates directory) over to the
 * polyfills output directory.
 *
 * @param templatePath the sub-path of the template file
 * @param updateContent optional function used to update the content of the template file
 */
async function copyTemplatePolyfill(
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
