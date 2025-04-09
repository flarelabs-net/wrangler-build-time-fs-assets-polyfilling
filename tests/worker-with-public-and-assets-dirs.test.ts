import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { runExample, type Example } from "./utils/index.ts";

let example: Example;

before(async () => {
	example = await runExample("worker-with-public-and-assets-dirs");
});

after(() => {
	example?.kill();
});

test("users can specify multiple assets (alongside an assets-output-dir)", async () => {
	assert(example, "testing error - example should be defined");

	const html = await (await fetch(`${example.url}`)).text();

	const document = new JSDOM(html).window.document;

	const documentTitle = document.querySelector("h1")?.textContent;
	assert.strictEqual(
		documentTitle,
		"Worker with public and assets directories"
	);

	const publicHtmlTree = document.querySelector('[test-id="tree-for-/public"]');
	assert(publicHtmlTree, "the HTML tree for /public should exist");
	const assetsHtmlTree = document.querySelector('[test-id="tree-for-/assets"]');
	assert(assetsHtmlTree, "the HTML tree for /assets should exist");
});

test("readdir with withFileTypes: true works", async () => {
	assert(example, "testing error - example should be defined");

	// note: building the directory trees require withFileTypes set to true since we
	//       check run `file.isFile()` when building the trees, so this test is indirectly
	//       making sure that readdir with withFileTypes does work

	const html = await (await fetch(`${example.url}`)).text();

	const document = new JSDOM(html).window.document;

	const publicTreeContent =
		document
			.querySelector('[test-id="tree-for-/public"]')
			?.textContent?.replaceAll(/[\t\n]/g, "") ?? "";
	assert.match(
		publicTreeContent.trim(),
		/^├─ \/public ├─ dir ├─ sub-dir ├─ sub-sub-dir ─ inner\.txt/
	);

	const publicInnerTxtFileContent = document
		.querySelector(
			'[test-id="tree-for-/public"] [test-id="content-of-inner.txt-file"]'
		)
		?.textContent?.trim();
	assert.strictEqual(
		publicInnerTxtFileContent,
		"I am inside public / dir / sub-dir / sub-sub-dir, I'm quite nested aren't I?"
	);

	const publicHelloTxtFileContent = document
		.querySelector(
			'[test-id="tree-for-/public"] [test-id="content-of-hello.txt-file"]'
		)
		?.textContent?.trim();
	assert.strictEqual(
		publicHelloTxtFileContent,
		"Hello from the public directory!"
	);

	const publicGoodbyeTxtFileContent = document
		.querySelector(
			'[test-id="tree-for-/public"] [test-id="content-of-goodbye.txt-file"]'
		)
		?.textContent?.trim();
	assert.strictEqual(
		publicGoodbyeTxtFileContent,
		"Goodbye from the public directory!"
	);

	const assetsTreeContent =
		document
			.querySelector('[test-id="tree-for-/assets"]')
			?.textContent?.replaceAll(/[\t\n]/g, "") ?? "";
	assert.match(assetsTreeContent.trim(), /^├─ \/assets ─ goodbye\.txt/);

	const assetsHelloTxtFileContent = document
		.querySelector(
			'[test-id="tree-for-/assets"] [test-id="content-of-hello.txt-file"]'
		)
		?.textContent?.trim();
	assert.strictEqual(
		assetsHelloTxtFileContent,
		"Hello from the assets directory!"
	);
});
