import fsPolyfill from "../fs";
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

export default {
	readdir,
};
