import { getHtmlResponse } from "./utils/html";

const fsFunctions = [
	{
		name: "readdir",
		getPageModule: () => import("./pages/readdir"),
	},
	{
		name: "exists",
		getPageModule: () => import("./pages/exists"),
	},
	{
		name: "existsSync",
		getPageModule: () => import("./pages/existsSync"),
	},
	{
		name: "promises/readdir",
		getPageModule: () => import("./pages/promises/readdir"),
	},
	{
		name: "promises/readFile",
		getPageModule: () => import("./pages/promises/readFile"),
	},
	{
		name: "promises/glob",
		getPageModule: () => import("./pages/promises/glob"),
	},
];

export default {
	async fetch(request) {
		const { pathname } = new URL(request.url);

		for (const fn of fsFunctions) {
			if (pathname === `/${fn.name}`) {
				const fnPageModule = await fn.getPageModule();
				return fnPageModule.getPageResponse();
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
