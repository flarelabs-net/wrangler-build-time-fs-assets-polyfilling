import { existsSync } from "node:fs";
import { getHtmlResponse } from "../utils/html";

export async function getPageResponse() {
	const filesToCheckExistenceOf = [
		"/public/file1.md",
		"/public/file2.md",
		"/public/file3.md",
		"/public/dir/file1.md",
		"/public/dir/file2.md",
		"/public/dir/file3.md",
	];

	const checks = filesToCheckExistenceOf.map((file) => ({
		file,
		result: existsSync(file),
	}));

	return getHtmlResponse(
		`
			<h1><code>existsSync</code></h1>
			<p>various checks run with <code>existsSync</code></p>
			<ul>
				${checks.map(({ file, result }, i) => `<li test-id="existsSync-checks-list-file-${i}">calling <code>existsSync("${file}")</code> returns <code>${result}</code>`).join("")}
			</ul>
		`
	);
}
