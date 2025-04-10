import { access, cp, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import type nodeFs from "node:fs";
import { generateAssetsManifest } from "./manifests";

/**
 * Handles all the assets requested by the user, this means that the assets are validated,
 * collected, appropriate assets manifests are generated in the manifests output directory
 * and the assets are also copied over the assets output directory if one was requested.
 *
 * @param assetsPaths the assets paths the user provided
 * @param assetsOutputDir the optional assets output directory the user might have provided
 */
export async function handleAllAssets(
	assetsPaths: string[],
	assetsOutputDir: string | null
): Promise<void> {
	await validateAssets(assetsPaths);

	if (assetsOutputDir) {
		await mkdir(assetsOutputDir, { recursive: true });
	}

	for (const assetsPath of assetsPaths) {
		await handleAssetPath(assetsPath, assetsOutputDir);
	}
}

/**
 * Handles a specific assets path requested by the user, this means that all the assets
 * inside the directory are collected,an appropriate assets manifests for them is
 * generated in the manifests output directory and the assets are also copied over
 * the assets output directory if one was requested.
 *
 * @param assetsPaths the assets path the user provided
 * @param assetsOutputDir the optional assets output directory the user might have provided
 */
async function handleAssetPath(
	assetsPath: string,
	assetsOutputDir: string | null
): Promise<void> {
	if (assetsPath.startsWith("./")) {
		assetsPath = assetsPath.slice("./".length);
	}

	if (assetsPath.includes("/")) {
		// TODO: add support for this
		throw new Error("Nested paths as assets not supported");
	}

	if (assetsOutputDir) {
		await cp(assetsPath, join(assetsOutputDir, assetsPath), {
			recursive: true,
			force: true,
		});
	}

	const pagesChildren = await collectDirChildren(assetsPath);

	const directoryDirent = generateDirentDirent(
		assetsPath.split("/"),
		pagesChildren
	);

	await generateAssetsManifest(assetsPath, directoryDirent);
}

/**
 * Collects all serializable dirent objects for the all the files and directories
 * (recursively) in a specified directory.
 *
 * @param path the directory to collect the dirent objects from
 * @returns an array of dirent objects
 */
async function collectDirChildren(path: string): Promise<SerializableDirent[]> {
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

/**
 * Generates a valid dirent object for the specified paths and children.
 *
 * Example:
 *    - `paths` is [`public`, `assets`, `my-site`] (representing the `public/assets/my-site/` path)
 *    - `children` is <CHILDREN> (representing all the files and dirs inside `public/assets/my-site/`)
 *    This function returns a dirent object with roughly the following structure:
 *      {
 *        type: "directory",
 *        name: "public",
 *        children: [{
 *          type: "directory",
 *          name: "assets",
 *          children: [{
 *            type: "directory",
 *            name: "my-site",
 *            children: <CHILDREN>
 *          }]
 *        }]
 *      }
 *
 * @param paths the paths to generate the dirent object for
 * @param children the children of the dirent object
 * @returns a valid dirent object
 */
function generateDirentDirent(
	paths: string[],
	children: SerializableDirent[]
): SerializableDirentDirectory {
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
		children: [generateDirentDirent(paths.slice(1), children)],
	};
}

/**
 * Ensures that all specified asset directories exists and are accessible.
 *
 * @param assetsPaths array of all the various assets paths requested by the user
 */
async function validateAssets(assetsPaths: string[]): Promise<void> {
	for (const path of assetsPaths) {
		await access(path);
	}
}

type SerializableDirentBase = Pick<nodeFs.Dirent, "name" | "parentPath">;

export type SerializableDirentFile = SerializableDirentBase & { type: "file" };

export type SerializableDirentDirectory = SerializableDirentBase & {
	type: "directory";
	children: SerializableDirent[];
};

export type SerializableDirent =
	| SerializableDirentFile
	| SerializableDirentDirectory;
