import { access, cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { baseOutputAssetsDir, baseOutputManifestsDir } from "./dirs";

export async function validateAssets(assets: string[]): Promise<void> {
	for (const asset of assets) {
		await access(asset);
	}
}

function generateDirentLikeBase(
	paths: string[],
	children: DirentLike[]
): DirentLikeDir {
	if (paths.length === 0) {
		throw new Error("Unexpected paths argument");
	}

	if (paths.length === 1) {
		return {
			parentPath: paths[0],
			type: "directory",
			name: paths[0],
			children,
		};
	}

	return {
		parentPath: paths[0],
		type: "directory",
		name: paths[0],
		children: [generateDirentLikeBase(paths.slice(1), children)],
	};
}

export async function collectAndCopyAssets(path: string): Promise<void> {
	if (path.includes("/")) {
		// TODO: add support for this
		throw new Error("Nested paths as assets not supported");
	}

	await cp(path, join(baseOutputAssetsDir, path), {
		recursive: true,
		force: true,
	});

	const manifestOutputFilepath = `${baseOutputManifestsDir}/${dirname(path)}/${basename(path)}.mjs`;

	const pagesChildren = await collectDirChildren(path);
	await mkdir(dirname(manifestOutputFilepath), {
		recursive: true,
	});

	const direntLike = [generateDirentLikeBase(path.split("/"), pagesChildren)];

	await writeFile(
		manifestOutputFilepath,
		`export default ${JSON.stringify(direntLike)}`
	);
}

type DirentLikeBase = { name: string; parentPath: string };

type DirentLikeFile = DirentLikeBase & { type: "file" };

type DirentLikeDir = DirentLikeBase & {
	type: "directory";
	children: DirentLike[];
};

type DirentLike = DirentLikeFile | DirentLikeDir;

async function collectDirChildren(path: string): Promise<DirentLike[]> {
	const dirContent = await readdir(path, { withFileTypes: true });

	return Promise.all(
		dirContent.map(async (item) => {
			const base = {
				name: item.name,
				parentPath: item.parentPath,
			};
			if (item.isFile()) {
				return { ...base, type: "file" };
			} else {
				const dirInfo = await collectDirChildren(
					`${item.parentPath}/${item.name}`
				);
				return { ...base, type: "directory", children: dirInfo };
			}
		})
	);
}
