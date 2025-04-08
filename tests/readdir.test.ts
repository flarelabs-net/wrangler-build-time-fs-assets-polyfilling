import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { runExample } from "./utils/index.ts";

describe("readdir", () => {
	it("works as intended", async () => {
		const example = await runExample("worker-with-public-dir");

		const html = await (await fetch(example.url)).text();
		example.kill();

		const document = new JSDOM(html).window.document;

		const renderedReaddirFiles = [
			...document.querySelectorAll('[test-id^="readdir-public-list-file-"]'),
		].map((li) => li.textContent);
		assert.deepStrictEqual(renderedReaddirFiles, [
			"dir (which is a directory)",
			"file1.md (which is a file)",
			"file2.md (which is a file)",
		]);
	});
});
