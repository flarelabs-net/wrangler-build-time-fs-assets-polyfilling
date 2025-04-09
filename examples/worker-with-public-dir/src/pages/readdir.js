import { readdir } from "node:fs";
import { getHtmlResponse } from "../utils/html";

export async function getPageResponse() {
	const dirsToRead = ["/public", "/public/file1.md", "/my-assets"];

	const reads = await Promise.all(
		dirsToRead.map((dir) =>
			new Promise((resolve, reject) => {
				readdir(dir, (error, files) => {
					if (error) {
						return reject(error);
					}
					resolve(files);
				});
			})
				.then((files) => ({
					dir,
					files,
				}))
				.catch((error) => ({
					dir,
					error: error.message,
				}))
		)
	);

	return getHtmlResponse(
		`
			<h1><code>readdir</code> from <code>node:fs</code></h1>
			<p>The following section contain the listing the directories read using <code>readdir</code></p>
			${reads
				.map(
					({ dir, files, error }) => `
						<h2>${dir}</h2>
						${
							files
								? `<pre style="color: gray" test-id="readdir-content-${dir}"><ul>${files
										.map((file) => `<li>${file}</li>`)
										.join("")}</ul></pre>`
								: `<pre style="color: red" test-id="readdir-error-${dir}">${error}</pre>`
						}
					`
				)
				.join("\n")}
		`
	);
}
