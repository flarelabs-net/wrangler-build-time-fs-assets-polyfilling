import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { runExample, type Example } from "./utils/index.ts";

let example: Example;

before(async () => {
	example = await runExample("worker-with-public-dir");
});

after(() => {
	example?.kill();
});

describe("readdir", () => {
	it("works as intended", async () => {
		assert(example, "testing error - example should be defined");

		const html = await (await fetch(example.url)).text();

		const document = new JSDOM(html).window.document;

		const renderedReaddirFiles = [
			...document.querySelectorAll('[test-id^="readdir-public-list-file-"]'),
		].map((li) => li.textContent?.trim());
		assert.deepStrictEqual(renderedReaddirFiles, [
			"dir (which is a directory)",
			"file1.md (which is a file)",
			"file2.md (which is a file)",
		]);
	});
});

describe("exists and existsSync", () => {
	describe("existsSync", () => {
		it("works as intended", async () => {
			const html = await (await fetch(example.url)).text();
			const document = new JSDOM(html).window.document;
			const renderedReaddirFiles = [
				...document.querySelectorAll(
					'[test-id^="exists-sync-checks-list-file-"]'
				),
			].map((li) => li.textContent?.trim());
			assert.deepStrictEqual(renderedReaddirFiles, [
				'calling existsSync("/public/file1.md") returns true',
				'calling existsSync("/public/file2.md") returns true',
				'calling existsSync("/public/file3.md") returns false',
				'calling existsSync("/public/dir/file1.md") returns false',
				'calling existsSync("/public/dir/file2.md") returns false',
				'calling existsSync("/public/dir/file3.md") returns true',
			]);
		});
	});

	describe("exists", () => {
		it("works as intended", async () => {
			const html = await (await fetch(example.url)).text();
			const document = new JSDOM(html).window.document;
			const renderedReaddirFiles = [
				...document.querySelectorAll('[test-id^="exists-checks-list-file-"]'),
			].map((li) => li.textContent?.trim());
			assert.deepStrictEqual(renderedReaddirFiles, [
				'calling existsSync("/public/file1.md") returns true',
				'calling existsSync("/public/file2.md") returns true',
				'calling existsSync("/public/file3.md") returns false',
				'calling existsSync("/public/dir/file1.md") returns false',
				'calling existsSync("/public/dir/file2.md") returns false',
				'calling existsSync("/public/dir/file3.md") returns true',
			]);
		});
	});
});
