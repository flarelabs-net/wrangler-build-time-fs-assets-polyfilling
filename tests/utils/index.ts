import { spawn } from "node:child_process";

export type Example = {
	url: string;
	kill: () => void;
};

export async function runExample(exampleName: string): Promise<Example> {
	return await new Promise((resolve) => {
		const child = spawn("npm", ["run", "dev"], {
			cwd: `./examples/${exampleName}`,
		});

		child.stdout.on("data", (data) => {
			const dataStr = `${data}`;
			const match = dataStr.match(
				new RegExp(`\\[wrangler:inf\\] Ready on (?<url>http://localhost:\\d+)`)
			);
			if (match && match.groups?.url) {
				const url = match.groups.url;
				resolve({
					url,
					kill: () => {
						child.kill();
						child.stdout.destroy();
						child.stderr.destroy();
						child.stdin.destroy();
					},
				});
			}
		});
	});
}
