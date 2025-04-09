import promises from "./fs/promises";
import type fs from "node:fs";

// @ts-expect-error -- this is solved at runtime
import * as manifestIndex from "../../manifests/index.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getManifest: (path: string) => any[] = manifestIndex.getManifest;

export function readdir(
	...args: Parameters<typeof fs.readdir>
): ReturnType<typeof fs.readdir> {
	const [path, options, callback] = args;
	const withFileTypes = !!options.withFileTypes;

	if (!withFileTypes) {
		// TODO: support readdir with withFileTypes false too
		throw new Error("fs#readdir please call readdir with withFileTypes true");
	}

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
			targetDirent.children.map((child: any) => ({
				name: child.name,
				parentPath: child.parentPath,
				path: child.path,
				isFile: () => child.type === "file",
				isDirectory: () => child.type === "directory",
					}));

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
	// remove the leading `/`
	path = path.slice(1);

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
