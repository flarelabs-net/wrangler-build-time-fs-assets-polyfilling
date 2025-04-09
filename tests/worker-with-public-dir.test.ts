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

describe("node:fs", () => {
	describe("readdir", () => {
		it("works as intended", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (await fetch(`${example.url}/readdir`)).text();

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
				const html = await (await fetch(`${example.url}/existsSync`)).text();
				const document = new JSDOM(html).window.document;
				const renderedReaddirFiles = [
					...document.querySelectorAll(
						'[test-id^="existsSync-checks-list-file-"]'
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
				const html = await (await fetch(`${example.url}/exists`)).text();
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
});

describe("node:fs/promises", () => {
	describe("readdir", () => {
		it("works as intended", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (
				await fetch(`${example.url}/promises/readdir`)
			).text();

			const document = new JSDOM(html).window.document;

			const renderedReaddirFiles = [
				...document.querySelectorAll(
					'[test-id^="promises-readdir-public-list-file-"]'
				),
			].map((li) => li.textContent?.trim());
			assert.deepStrictEqual(renderedReaddirFiles, [
				"dir (which is a directory)",
				"file1.md (which is a file)",
				"file2.md (which is a file)",
			]);
		});
	});

	describe("readFile", () => {
		it("reads the content of existing files", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (
				await fetch(`${example.url}/promises/readFile`)
			).text();

			const document = new JSDOM(html).window.document;

			const file1Content = document
				.querySelector('[test-id="promises-readfile-content-/public/file1.md"]')
				?.textContent?.trim();
			assert.strictEqual(file1Content, "# File 1");
			const file2Content = document
				.querySelector('[test-id="promises-readfile-content-/public/file2.md"]')
				?.textContent?.trim();
			assert.strictEqual(file2Content, "# File 2");
			const file3Content = document
				.querySelector(
					'[test-id="promises-readfile-content-/public/dir/file3.md"]'
				)
				?.textContent?.trim();
			assert.strictEqual(file3Content, "# File 3");
		});

		it("errors when run against non-existing files", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (
				await fetch(`${example.url}/promises/readFile`)
			).text();

			const document = new JSDOM(html).window.document;

			const file3Content = document
				.querySelector('[test-id="promises-readfile-error-/public/file3.md"]')
				?.textContent?.trim();
			assert.strictEqual(
				file3Content,
				"ENOENT: no such file or directory, open '/public/file3.md'"
			);
		});

		it("errors when run against directories", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (
				await fetch(`${example.url}/promises/readFile`)
			).text();

			const document = new JSDOM(html).window.document;

			const file3Content = document
				.querySelector('[test-id="promises-readfile-error-/public"]')
				?.textContent?.trim();
			assert.strictEqual(
				file3Content,
				"EISDIR: illegal operation on a directory, read"
			);
		});
	});
});
