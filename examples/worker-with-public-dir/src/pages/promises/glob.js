import { getHtmlResponse } from "../../utils/html";
import { glob } from "node:fs/promises";

export async function getPageResponse() {
	const calls = [
		{
			pattern: "**/*.md",
			cwd: "public",
		},
		{
			pattern: "**/*.md",
			cwd: "public/dir",
		},
		{
			pattern: "**/*.{txt}",
			cwd: "public/dir",
		},
		{
			pattern: "**/*.{md,txt}",
			cwd: "public/dir",
		},
	];
	const callsWithResults = await Promise.all(
		calls.map(async (call) => {
			const iterator = Array.fromAsync(glob(call.pattern, { cwd: call.cwd }));
			const results = await iterator;
			return { ...call, results };
		})
	);

	return getHtmlResponse(
		`
			<h1><code>glob</code> from <code>node:fs/promises</code></h1>
			<p>The following section contain example runs of the <code>glob</code> function</p>
			${callsWithResults
				.map(
					({ pattern, cwd, results }) => `
						<h2><code>glob("${pattern}", { cwd: "${cwd}"})</code></h2>
						${`<pre style="color: gray" test-id="glob-content-${pattern}-${cwd}"><ul>${results
							.map((file) => `<li>${file}</li>`)
							.join("")}</ul></pre>`}
					`
				)
				.join("\n")}
		<br>
        `
	);
}
