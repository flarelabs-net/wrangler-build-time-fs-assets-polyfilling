import promises from "fs/promises";
import type fs from "fs";

export function readdir(
	...args: Parameters<typeof fs.readdir>
): ReturnType<typeof fs.readdir> {
	const [path, options, callback] = args;
	const withFileTypes = !!options.withFileTypes;

	if (!withFileTypes) {
		// TODO: support readdir with withFileTypes false too
		throw new Error("fs#readdir please call readdir with withFileTypes true");
	}

	findInDirentLikes(`${path}`)
		.then((result) => {
			const results =
				!result || result.type !== "directory"
					? []
					: // eslint-disable-next-line @typescript-eslint/no-explicit-any
						result.children.map((c: any) => ({
							name: c.name,
							parentPath: c.parentPath,
							path: c.path,
							isFile: () => c.type === "file",
							isDirectory: () => c.type === "directory",
						}));

			callback?.(null, results);
		})
		.catch((err) => {
			if (err instanceof Error && err.message === "Assets Manifest not found") {
				return callback?.(
					new Error(`ENOENT: no such file or directory, scandir ${path}`),
					[]
				);
			}
			callback?.(err, []);
		});
}

async function findInDirentLikes(path: string) {
	// remove the leading `/`
	path = path.slice(1);

	const paths = path.split("/");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getManifest: (path: string) => any[] = // @ts-ignore
		(await import(`../../manifests/index.mjs`)).default;

	const manifest = getManifest(path);

	if (!manifest) {
		throw new Error("Assets Manifest not found");
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
	args: Parameters<typeof fs.exists>
): ReturnType<typeof fs.exists> {
	const [path, callback] = args;
	const result = existsImpl(path);
	callback(result);
}

export function existsSync(
	args: Parameters<typeof fs.existsSync>
): ReturnType<typeof fs.existsSync> {
	const [path] = args;
	const result = existsImpl(path);
	return result;
}

function existsImpl(path: fs.PathLike) {
	return !!findInDirentLikes(`${path}`);
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
