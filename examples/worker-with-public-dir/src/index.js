import { getExistsPageResponse } from "./pages/exists";
import { getExistsSyncPageResponse } from "./pages/existsSync";
import { getReaddirPageResponse } from "./pages/readdir";
import { getPromisesReaddirPageResponse } from "./pages/promises/readdir";
import { getPromisesReadFilePageResponse } from "./pages/promises/readFile";
import { getHtmlResponse } from "./utils/html";

const fsFunctions = [
	{
		name: "readdir",
		getPageResponse: getReaddirPageResponse,
	},
	{
		name: "exists",
		getPageResponse: getExistsPageResponse,
	},
	{
		name: "existsSync",
		getPageResponse: getExistsSyncPageResponse,
	},
	{
		name: "promises/readdir",
		getPageResponse: getPromisesReaddirPageResponse,
	},
	{
		name: "promises/readFile",
		getPageResponse: getPromisesReadFilePageResponse,
	},
];

export default {
	async fetch(request) {
		const { pathname } = new URL(request.url);

		for (const fn of fsFunctions) {
			if (pathname === `/${fn.name}`) {
				return fn.getPageResponse();
			}
		}

		return getHtmlResponse(
			`
				<h1>Worker with Public dir</h1>
				<p>This is a worker that generates server side HTML using the fs build time polyfills against a <code>/public</code> directory</p>
				<p>Each fs polyfill function has its own page:</p>
				<ul>\n${fsFunctions.map(({ name }) => `<li><a href="/${name}"><code>${name}</code></a></li>`).join("\n")}\n</ul>
			`
		);
	},
};
