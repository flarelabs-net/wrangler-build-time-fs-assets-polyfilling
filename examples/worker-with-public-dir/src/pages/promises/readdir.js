import { readdir } from "node:fs/promises";
import { getHtmlResponse } from "../../utils/html";

export async function getPromisesReaddirPageResponse() {
	const publicFiles = await readdir("/public", { withFileTypes: true });

	return getHtmlResponse(
		"exist",
		`
			<h1><code>readdir</code> from <code>node:fs/promises</code></h1>
			<p><code>readdir</code> run against <code>'/public'</code> results in: </p>
			<ul>
				${publicFiles.map((file, i) => `<li test-id="promises-readdir-public-list-file-${i}">${file.name} (which is a ${file.isFile() ? "file" : "directory"})</li>`).join("")}
			</ul>
		`
	);
}
