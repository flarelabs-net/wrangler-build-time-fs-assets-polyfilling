import type fs from "node:fs";
import promises from "./fs/promises";

// @ts-expect-error -- this is solved at runtime
import * as manifestIndex from "../../manifests/index.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getManifest: (path: string) => any[] = manifestIndex.getManifest;

export function readdir(
	...args: Parameters<typeof fs.readdir>
): ReturnType<typeof fs.readdir> {
	const path = args[0];
	const options: Partial<Parameters<typeof fs.readdir>[1]> =
		typeof args[1] === "function" ? {} : args[1];
	const callback = typeof args[1] === "function" ? args[1] : args[2];

	const withFileTypes = !!options?.withFileTypes;

	try {
		const targetDirent = __findInDirentLikes(`${path}`);

		if (!targetDirent) {
			throw new Error(`ENOENT: no such file or directory, scandir '${path}'`);
		}

		if (targetDirent.type !== "directory") {
			throw new Error(`ENOTDIR: not a directory, scandir '${path}'`);
		}

		const results =
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			targetDirent.children.map((child: any) => {
				if (!withFileTypes) {
					return child.name;
				}

				return {
					name: child.name,
					parentPath: child.parentPath,
					path: child.path,
					isFile: () => child.type === "file",
					isDirectory: () => child.type === "directory",
				};
			});

		callback?.(null, results);
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

export function __findInDirentLikes(path: string) {
	// remove the potential leading `/`
	if (path.startsWith("/")) path = path.slice(1);

	const paths = path.split("/");

	const manifest = getManifest(paths[0]);

	if (!manifest) {
		return null;
	}

	return recursivelyFindInDirentLikes(paths, manifest);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function recursivelyFindInDirentLikes(paths: string[], direntLikes: any[]) {
		const [current, ...restOfPaths] = paths;
		const found = direntLikes.find((item) => item.name === current);
		if (!found) return null;
		if (restOfPaths.length === 0) return found;
		if (found.type !== "directory") return null;
		return recursivelyFindInDirentLikes(restOfPaths, found.children);
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

function existsImpl(path: fs.PathLike) {
	return !!__findInDirentLikes(`${path}`);
}

export function realpathSync() {
	return true;
}

export default {
	readdir,
	exists,
	existsSync,
	realpathSync,
	promises,
};
