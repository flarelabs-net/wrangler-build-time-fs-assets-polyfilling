import fsPolyfill, { __findInDirentLikes } from "../fs";
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
	const direntLike = __findInDirentLikes(path);
	if (!direntLike) {
		throw new Error(`ENOENT: no such file or directory, open '${path}'`);
	}
	if (direntLike.type === "directory") {
		throw new Error("EISDIR: illegal operation on a directory, read");
	}

	// Note: we only care about the url's path, the domain is not relevant here
	const url = new URL(`/${path}`, "http://0.0.0.0");
	// @ts-ignore
	const env = (await import("cloudflare:workers")).env;
	const response = await env.ASSETS.fetch(url);
	const text = await response.text();
	return text;
}

export default {
	readdir,
	readFile,
};
