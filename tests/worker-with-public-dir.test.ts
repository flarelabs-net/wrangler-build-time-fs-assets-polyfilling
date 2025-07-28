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
		it("lists the content of an existing directory", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (await fetch(`${example.url}/readdir`)).text();

			const document = new JSDOM(html).window.document;

			const renderedReaddirFiles = document
				.querySelector('[test-id="readdir-content-/public"]')
				?.textContent?.trim();
			assert.strictEqual(
				renderedReaddirFiles,
				["dir", "file1.md", "file2.md"].join("")
			);
		});

		it("errors on non-existing directories", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (await fetch(`${example.url}/readdir`)).text();

			const document = new JSDOM(html).window.document;

			const renderedReaddirFiles = document
				.querySelector('[test-id="readdir-error-/my-assets"]')
				?.textContent?.trim();
			assert.strictEqual(
				renderedReaddirFiles,
				"ENOENT: no such file or directory, scandir '/my-assets'"
			);
		});

		it("errors on files", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (await fetch(`${example.url}/readdir`)).text();

			const document = new JSDOM(html).window.document;

			const renderedReaddirFiles = document
				.querySelector('[test-id="readdir-error-/public/file1.md"]')
				?.textContent?.trim();
			assert.strictEqual(
				renderedReaddirFiles,
				"ENOTDIR: not a directory, scandir '/public/file1.md'"
			);
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
		it("lists the content of an existing directory", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (
				await fetch(`${example.url}/promises/readdir`)
			).text();

			const document = new JSDOM(html).window.document;

			const renderedReaddirFiles = document
				.querySelector('[test-id="promises-readdir-content-/public"]')
				?.textContent?.trim();
			assert.strictEqual(
				renderedReaddirFiles,
				["dir", "file1.md", "file2.md"].join("")
			);
		});

		it("errors on non-existing directories", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (
				await fetch(`${example.url}/promises/readdir`)
			).text();

			const document = new JSDOM(html).window.document;

			const renderedReaddirFiles = document
				.querySelector('[test-id="promises-readdir-error-/my-assets"]')
				?.textContent?.trim();
			assert.strictEqual(
				renderedReaddirFiles,
				"ENOENT: no such file or directory, scandir '/my-assets'"
			);
		});

		it("errors on files", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (
				await fetch(`${example.url}/promises/readdir`)
			).text();

			const document = new JSDOM(html).window.document;

			const renderedReaddirFiles = document
				.querySelector('[test-id="promises-readdir-error-/public/file1.md"]')
				?.textContent?.trim();
			assert.strictEqual(
				renderedReaddirFiles,
				"ENOTDIR: not a directory, scandir '/public/file1.md'"
			);
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
			const fileOutsideOfPublicDirContent = document
				.querySelector('[test-id="promises-readfile-error-/my-assets/file.md"]')
				?.textContent?.trim();
			assert.strictEqual(
				fileOutsideOfPublicDirContent,
				"ENOENT: no such file or directory, open '/my-assets/file.md'"
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

	describe("glob", () => {
		it("can perform simple recursive searches on for a specific extension", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (await fetch(`${example.url}/promises/glob`)).text();

			const document = new JSDOM(html).window.document;

			const mdPublicContent = document
				.querySelector('[test-id="glob-content-**/*.md-public"]')
				?.textContent?.trim();
			assert.strictEqual(
				mdPublicContent,
				["file1.md", "file2.md", "dir/file3.md"].join("")
			);
			const mdPublicDirContent = document
				.querySelector('[test-id="glob-content-**/*.md-public/dir"]')
				?.textContent?.trim();
			assert.strictEqual(mdPublicDirContent, ["file3.md"].join(""));
		});

		it("can perform simple recursive searches on for a specific extension wrapped in curly braces", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (await fetch(`${example.url}/promises/glob`)).text();

			const document = new JSDOM(html).window.document;

			const txtPublicContent = document
				.querySelector('[test-id="glob-content-**/*.{txt}-public/dir"]')
				?.textContent?.trim();
			assert.strictEqual(
				txtPublicContent,
				["file4.txt", "inner-dir/inner-inner-dir/file5.txt"].join("")
			);
		});

		it("can perform simple recursive searches on for a set of extensions", async () => {
			assert(example, "testing error - example should be defined");

			const html = await (await fetch(`${example.url}/promises/glob`)).text();

			const document = new JSDOM(html).window.document;

			const mdPublicContent = document
				.querySelector('[test-id="glob-content-**/*.{md,txt}-public/dir"]')
				?.textContent?.trim();
			assert.strictEqual(
				mdPublicContent,
				["file3.md", "file4.txt", "inner-dir/inner-inner-dir/file5.txt"].join(
					""
				)
			);
		});
	});
});
