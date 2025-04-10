import { glob } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { baseOutputManifestsDir } from "./dirs";
import type { DirentLikeDir } from "./assets";

/**
 * Generates an `index.mjs` in the manifests output directory that exports
 * a `getManifest(path)` function that can be used to obtain a specific
 * directory manifest
 */
export async function generateManifestsIndex(): Promise<void> {
	const baseOutputManifestsDirWithoutPrefix = baseOutputManifestsDir.replace(
		/^.\//,
		""
	);

	const files: string[] = await new Promise((resolve, reject) => {
		glob(`${baseOutputManifestsDir}/**/*.mjs`, (err, files) => {
			if (err) {
				reject(err);
			}
			resolve(files);
		});
	});

	const filesData = files.map((file) => {
		const path = file.slice(
			baseOutputManifestsDir.length - 1,
			file.length - `.mjs`.length
		);
		return {
			path: path,
			manifestName: `__manifest_${path.replaceAll(/[/-]/g, "_")}`,
			file: file.replace(`${baseOutputManifestsDirWithoutPrefix}`, "."),
		};
	});

	const script = `${filesData
		.map(({ file, manifestName }) => `import ${manifestName} from "${file}";`)
		.join("\n")}\n\nexport function getManifest(path) {\n${filesData
		.map(
			({ path, manifestName }) =>
				` if (path === "${path}") return ${manifestName};`
		)
		.join("\n")}\n return null;\n}`;

	await writeFile(`${baseOutputManifestsDir}/index.mjs`, script, "utf8");
}

/**
 * Given the assets path and the dirent-like object describing it, generates an assets manifest file for it
 * which exports as default an array of the directory's dirent-like-dir object
 *
 * @param assetsPath the path of the assets directory
 * @param direntLikeDir the dirent-like-dir object representing the directory
 */
export async function generateAssetsManifest(
	assetsPath: string,
	direntLikeDir: DirentLikeDir
): Promise<void> {
	const manifestOutputFilepath = `${baseOutputManifestsDir}/${dirname(assetsPath)}/${basename(assetsPath)}.mjs`;

	await mkdir(dirname(manifestOutputFilepath), {
		recursive: true,
	});

	await writeFile(
		manifestOutputFilepath,
		`export default ${JSON.stringify([direntLikeDir])}`
	);
}
