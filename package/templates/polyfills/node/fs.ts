import type fs from "node:fs";
import promises from "./fs/promises";

import type {
	SerializableDirent,
	SerializableDirentDirectory,
} from "../../../src/assets";

// @ts-expect-error -- this is solved at runtime
import * as manifestIndex from "../../manifests/index.mjs";

export const getManifest: (
	path: string
) => null | SerializableDirentDirectory[] = manifestIndex.getManifest;

export function readdir(
	...args: Parameters<typeof fs.readdir>
): ReturnType<typeof fs.readdir> {
	const path = args[0];
	const options: Partial<Parameters<typeof fs.readdir>[1]> =
		typeof args[1] === "function" ? {} : args[1];
	const callback = typeof args[1] === "function" ? args[1] : args[2];

	const withFileTypes = !!options?.withFileTypes;

	try {
		const targetDirent = __findInDirent(`${path}`);

		if (!targetDirent) {
			throw new Error(`ENOENT: no such file or directory, scandir '${path}'`);
		}

		if (targetDirent.type !== "directory") {
			throw new Error(`ENOTDIR: not a directory, scandir '${path}'`);
		}

		const results = targetDirent.children.map((child) => {
			if (!withFileTypes) {
				return child.name;
			}

			return {
				name: child.name,
				parentPath: child.parentPath,
				path: child.parentPath,
				isFile: (): boolean => child.type === "file",
				isDirectory: (): boolean => child.type === "directory",
			};
		});

		callback?.(null, results as fs.Dirent[]);
	} catch (err) {
		if (err instanceof Error && err.message === "Assets Manifest not found") {
			return callback?.(
				new Error(`ENOENT: no such file or directory, scandir ${path}`),
				[]
			);
		}
		callback?.((err ?? null) as NodeJS.ErrnoException | null, []);
	}
}

export function __findInDirent(path: string): null | SerializableDirent {
	// remove the potential leading `/`
	if (path.startsWith("/")) path = path.slice(1);

	const paths = path.split("/");

	const manifest = getManifest(paths[0]);

	if (!manifest) {
		return null;
	}

	return recursivelyFindInDirent(paths, manifest);
	function recursivelyFindInDirent(
		paths: string[],
		dirents: SerializableDirent[]
	): null | SerializableDirent {
		const [current, ...restOfPaths] = paths;
		const found = dirents.find((dirent) => dirent.name === current);
		if (!found) return null;
		if (restOfPaths.length === 0) return found;
		if (found.type !== "directory") return null;
		return recursivelyFindInDirent(restOfPaths, found.children);
	}
}

export function exists(
	...args: Parameters<typeof fs.exists>
): ReturnType<typeof fs.exists> {
	const [path, callback] = args;
	const result = existsImpl(path);
	callback(result);
}

export function existsSync(
	...args: Parameters<typeof fs.existsSync>
): ReturnType<typeof fs.existsSync> {
	const [path] = args;
	const result = existsImpl(path);
	return result;
}

function existsImpl(path: fs.PathLike): boolean {
	return !!__findInDirent(`${path}`);
}

export function realpathSync(): boolean {
	// TODO: implement this properly
	return true;
}

export default {
	readdir,
	exists,
	existsSync,
	realpathSync,
	promises,
};
