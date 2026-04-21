import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../orchestrator';
import webserver from '../../../../../infra/webserver';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
});

describe('PUT /api/v1/migrations', () => {
	describe('Anonymous user', () => {
		it('Retrieving pending migrations', async () => {
			const response = await fetch(`${webserver.getOrigin()}/api/v1/migrations`, {
				method: 'PUT'
			});
			expect(response.status).toBe(405);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'MethodNotAllowedError',
				message: 'Método não permitido para este endpoint.',
				action: 'Verifique se o método HTTP enviado é válido para este endpoint.',
				status_code: 405
			});
		});
	});
});
