import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../orchestrator';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
});

describe('GET /api/v1/migrations', () => {
	describe('Anonymous user', () => {
		it('Retrieving pending migrations', async () => {
			const response = await fetch('http://localhost:5173/api/v1/migrations');
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(Array.isArray(responseBody)).toBe(true);
			expect(responseBody.length).toBeGreaterThan(0);
		});
	});
});
