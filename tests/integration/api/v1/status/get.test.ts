import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../orchestrator';
import { FEATURES_USER } from '../../../../../src/types/user';
import webserver from '../../../../../infra/webserver';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/status', () => {
	describe('Default user', () => {
		it('Retrieving current system status', async () => {
			const createdUser = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(createdUser.id);
			const sessionObject = await orchestrator.createSession(activatedUser.id);

			const response = await fetch(`${webserver.getOrigin()}/api/v1/status`, {
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
			expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

			expect(responseBody.dependencies.database.max_connections).toEqual(100);
			expect(responseBody.dependencies.database.opened_connections).toEqual(1);
			expect(responseBody.dependencies.database).not.toHaveProperty('version');
		});
	});

	describe('Anonymous user', () => {
		it('Retrieving current system status', async () => {
			const response = await fetch(`${webserver.getOrigin()}/api/v1/status`);
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
			expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

			expect(responseBody.dependencies.database.max_connections).toEqual(100);
			expect(responseBody.dependencies.database.opened_connections).toEqual(1);
			expect(responseBody.dependencies.database).not.toHaveProperty('version');
		});
	});

	describe('Privileged user', () => {
		it('With `read:status:all`', async () => {
			const privilegedUser = await orchestrator.createUser();
			const activedPrivilegedUser = await orchestrator.activateUser(privilegedUser.id);
			await orchestrator.addFeaturesToUser(privilegedUser, [FEATURES_USER.READ_STATUS_ALL]);
			const privilegedUserSession = await orchestrator.createSession(activedPrivilegedUser.id);

			const response = await fetch(`${webserver.getOrigin()}/api/v1/status`, {
				headers: {
					Cookie: `session_id=${privilegedUserSession.token}`
				}
			});

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
			expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

			expect(responseBody.dependencies.database.max_connections).toEqual(100);
			expect(responseBody.dependencies.database.opened_connections).toEqual(1);
			expect(responseBody.dependencies.database.version).toEqual('16.0');
		});
	});
});
