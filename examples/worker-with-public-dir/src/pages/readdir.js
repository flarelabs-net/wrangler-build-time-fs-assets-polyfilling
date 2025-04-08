import { readdir } from "node:fs";
import { getHtmlResponse } from "../utils/html";

export async function getReaddirPageResponse() {
	const publicFiles = await new Promise((resolve) => {
		readdir("/public", { withFileTypes: true }, (_, files) => {
			resolve(files);
		});
	});

	return getHtmlResponse(
		"exist",
		`
			<h1><code>readdir</code></h1>
			<p><code>readdir</code> run against <code>'/public'</code> results in: </p>
			<ul>
				${publicFiles.map((file, i) => `<li test-id="readdir-public-list-file-${i}">${file.name} (which is a ${file.isFile() ? "file" : "directory"})</li>`).join("")}
			</ul>
		`
	);
}
