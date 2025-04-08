import { glob } from "node:fs";
import { baseOutputManifestsDir } from "./dirs";
import { writeFile } from "node:fs/promises";

export async function generateManifestsIndex() {
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
