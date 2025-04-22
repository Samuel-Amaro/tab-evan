import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';

normalizePath(path.resolve(__dirname, 'src/infra/migrations'));

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			sveltekit(),
			viteStaticCopy({
				targets: [
					{
						src: 'src/infra/migrations/*',
						dest: './src/infra/migrations'
					}
				]
			})
		],
		server: {
			host: true
		},
		define: {
			'import.meta.env.POSTGRES_PASSWORD': JSON.stringify(env.POSTGRES_PASSWORD as string),
			'import.meta.env.POSTGRES_HOST': JSON.stringify(env.POSTGRES_HOST),
			'import.meta.env.POSTGRES_PORT': JSON.stringify(env.POSTGRES_PORT),
			'import.meta.env.POSTGRES_USER': JSON.stringify(env.POSTGRES_USER),
			'import.meta.env.POSTGRES_DB': JSON.stringify(env.POSTGRES_DB),
			'import.meta.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL)
		},
		test: {
			workspace: [
				{
					extends: './vite.config.ts',
					plugins: [svelteTesting()],
					test: {
						name: 'client',
						environment: 'jsdom',
						clearMocks: true,
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts']
					}
				},
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
					}
				}
			]
		}
	};
});
