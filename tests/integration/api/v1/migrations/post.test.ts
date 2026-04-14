import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../orchestrator';
import { FEATURES_USER } from '../../../../../src/types/user';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/migrations', () => {
	describe('Anonymous user', () => {
		it('Retrieving pending migrations', async () => {
			const response1 = await fetch('http://localhost:5173/api/v1/migrations', {
				method: 'POST'
			});
			expect(response1.status).toBe(403);

			const responseBody = await response1.json();
			expect(responseBody).toEqual({
				action: 'Verifique se o seu usuário possui a feature "create:migration"',
				message: 'Usuário não possui permissão para executar esta ação.',
				name: 'ForbiddenError',
				status_code: 403
			});
		});
	});

	describe('Privileged user', () => {
		it('With `create:migration`', async () => {
			const createdUser = await orchestrator.createUser();
			const activateUser = await orchestrator.activateUser(createdUser.id);
			await orchestrator.addFeaturesToUser(createdUser, [FEATURES_USER.CREATE_MIGRATION]);
			const sessionObject = await orchestrator.createSession(activateUser.id);

			const response = await fetch('http://localhost:5173/api/v1/migrations', {
				method: 'POST',
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(Array.isArray(responseBody)).toBe(true);
		});
	});

	describe('Default user', () => {
		it('Retrieving pending migrations', async () => {
			const createdUser = await orchestrator.createUser();
			const activateUser = await orchestrator.activateUser(createdUser.id);
			const sessionObject = await orchestrator.createSession(activateUser.id);

			const response = await fetch('http://localhost:5173/api/v1/migrations', {
				method: 'POST',
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});
			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				action: 'Verifique se o seu usuário possui a feature "create:migration"',
				message: 'Usuário não possui permissão para executar esta ação.',
				name: 'ForbiddenError',
				status_code: 403
			});
		});
	});
});
