import { exists } from "node:fs";
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

	const checks = await Promise.all(
		filesToCheckExistenceOf.map(
			(file) =>
				new Promise((resolve) => {
					exists(file, (result) => resolve({ file, result }));
				})
		)
	);

	return getHtmlResponse(
		`
			<h1><code>exists</code></h1>
			<p>various checks run with <code>exists</code></p>
			<ul>
				${checks.map(({ file, result }, i) => `<li test-id="exists-checks-list-file-${i}">calling <code>existsSync("${file}")</code> returns <code>${result}</code>`).join("")}
			</ul>
		`
	);
}
