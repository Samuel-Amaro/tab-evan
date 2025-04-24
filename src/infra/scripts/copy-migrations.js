// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

const srcDir = path.resolve('src/infra/migrations');
const destDir = path.resolve('.svelte-kit/output/server/src/infra/migrations');

fs.mkdirSync(destDir, { recursive: true });

fs.readdirSync(srcDir).forEach((file) => {
	const srcFile = path.join(srcDir, file);
	const destFile = path.join(destDir, file);
	fs.copyFileSync(srcFile, destFile);
	console.log(`Copied: ${file}`);
});
