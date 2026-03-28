import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../orchestrator';
import { FEATURES_USER } from '../../../../../src/types/user';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/migrations', () => {
	describe('Default user', () => {
		it('Retrieving pending migrations', async () => {
			const createdUser = await orchestrator.createUser();
			const activateUser = await orchestrator.activateUser(createdUser.id);
			const sessionObject = await orchestrator.createSession(activateUser.id);

			const response = await fetch('http://localhost:5173/api/v1/migrations', {
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});
			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				action: 'Verifique se o seu usuário possui a feature "read:migration"',
				message: 'Usuário não possui permissão para executar esta ação.',
				name: 'ForbiddenError',
				status_code: 403
			});
		});
	});

	describe('Privileged user', () => {
		it('With `read:migration`', async () => {
			const createdUser = await orchestrator.createUser();
			const activateUser = await orchestrator.activateUser(createdUser.id);
			await orchestrator.addFeaturesToUser(createdUser, [FEATURES_USER.READ_MIGRATION]);
			const sessionObject = await orchestrator.createSession(activateUser.id);

			const response = await fetch('http://localhost:5173/api/v1/migrations', {
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(Array.isArray(responseBody)).toBe(true);
		});
	});

	describe('Anonymous user', () => {
		it('Retrieving pending migrations', async () => {
			const response = await fetch('http://localhost:5173/api/v1/migrations');
			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				action: 'Verifique se o seu usuário possui a feature "read:migration"',
				message: 'Usuário não possui permissão para executar esta ação.',
				name: 'ForbiddenError',
				status_code: 403
			});
		});
	});
});
