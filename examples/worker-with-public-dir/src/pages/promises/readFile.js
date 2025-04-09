import { readFile } from "node:fs/promises";
import { getHtmlResponse } from "../../utils/html";

export async function getPageResponse() {
	const filesToRead = [
		"/public/file1.md",
		"/public/file2.md",
		"/public/dir/file3.md",
		"/public",
		"/public/file3.md",
	];

	const reads = await Promise.all(
		filesToRead.map((file) =>
			readFile(file, "utf-8")
				.then((result) => ({
					file,
					result: result,
				}))
				.catch((error) => ({
					file,
					error: error.message,
				}))
		)
	);

	return getHtmlResponse(
		`
			<h1><code>readFile</code> from <code>node:fs/promises</code></h1>
			<p>The following section contain the content of the public files read using <code>readFile</code></p>
			${reads
				.map(
					({ file, result, error }) => `
						<h2>${file}</h2>
						${
							result
								? `<pre style="color: gray" test-id="promises-readfile-content-${file}">${result}</pre>`
								: `<pre style="color: red" test-id="promises-readfile-error-${file}">${error}</pre>`
						}
					`
				)
				.join("\n")}
		`
	);
}
