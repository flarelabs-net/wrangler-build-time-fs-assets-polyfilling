import type { Dirent } from "node:fs";
import fsPolyfill, { __findInDirent } from "../fs";
import type fsPromises from "node:fs/promises";

export async function readdir(
	...args: Parameters<typeof fsPromises.readdir>
): ReturnType<typeof fsPromises.readdir> {
	const [path, options] = args;

	return new Promise<Awaited<ReturnType<typeof fsPromises.readdir>>>(
		(resolve, reject) => {
			fsPolyfill.readdir(path, options, (err, result) => {
				if (err) {
					return reject(err);
				}
				resolve(result);
			});
		}
	);
}

export async function readFile(
	path: string
): ReturnType<typeof fsPromises.readFile> {
	const dirent = __findInDirent(path);
	if (!dirent) {
		throw new Error(`ENOENT: no such file or directory, open '${path}'`);
	}
	if (dirent.type === "directory") {
		throw new Error("EISDIR: illegal operation on a directory, read");
	}

	// Important: the following assignment is updated at build time, `/` is needed
	//            when there is only a single assets directory, when there are more
	//            it needs not to be
	const addSlashPrefix = true;

	// Note: we only care about the url's path, the domain is not relevant here
	const url = new URL(`${addSlashPrefix ? "/" : ""}${path}`, "http://0.0.0.0");
	// @ts-ignore
	const env = (await import("cloudflare:workers")).env;
	const response = await env.ASSETS.fetch(url);
	const text = await response.text();
	return text;
}

export function glob(
	...args: Parameters<typeof fsPromises.glob>
): AsyncIterable<string> {
	const [pattern, options] = args;

	if (Array.isArray(pattern)) {
		throw new Error("only a single pattern is supported");
	}

	if (!options.cwd) {
		throw new Error("calling glob without a cwd is not supported");
	}

	const singleExtensionRecursiveRegex = /^\*\*\/\*\.(?<extension>\w+)$/;
	const extension = pattern.match(singleExtensionRecursiveRegex)?.groups
		?.extension;
	if (extension) {
		return promiseOrStringsToAsyncIterable(
			recursivelyDiscoverFilesWithExtension(options.cwd, [extension])
		);
	}

	const multiExtensionsRecursiveRegex =
		/^\*\*\/\*\.(?<extensions>{\w+(,\w+)*})$/;
	const extensionsStr = pattern.match(multiExtensionsRecursiveRegex)?.groups
		?.extensions;
	if (extensionsStr) {
		const extensions = extensionsStr.slice(1, -1).split(",");
		return promiseOrStringsToAsyncIterable(
			recursivelyDiscoverFilesWithExtension(options.cwd, extensions)
		);
	}

	throw new Error(
		`patterns ${JSON.stringify(pattern)} not supported` +
			"(currently only patterns such as `**/*.<ext>` or `**/*.{<ext1>,<ext2>,etc...}`) are supported"
	);
}

async function recursivelyDiscoverFilesWithExtension(
	dir: string,
	extensions: string[]
): Promise<string[]> {
	let dirents: Dirent[] = [];
	try {
		dirents = await readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const collected = dirents
		.filter(
			(dirent) =>
				dirent.isFile() &&
				extensions.some((ext) => dirent.name.endsWith(`.${ext}`))
		)
		.map((dirent) => dirent.name);
	const dirs = dirents.filter((dirent) => dirent.isDirectory());
	for (const dir of dirs) {
		const dirCollected = await recursivelyDiscoverFilesWithExtension(
			`${dir.parentPath}/${dir.name}`,
			extensions
		);
		dirCollected.forEach((item) => collected.push(`${dir.name}/${item}`));
	}
	return collected;
}

function promiseOrStringsToAsyncIterable(
	promise: Promise<string[]>
): AsyncIterable<string> {
	return (async function* (): AsyncGenerator<string, void, unknown> {
		const strings = await promise;
		for (const str of strings) {
			yield str;
		}
	})();
}

export default {
	readdir,
	readFile,
	glob,
};
