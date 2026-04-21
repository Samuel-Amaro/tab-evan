import { beforeAll, describe, expect, it, vi } from 'vitest';
import orchestrator from '../../../../../orchestrator';
import activation from '../../../../../../src/models/activation';
import type { TypeActivationToken } from '../../../../../../src/types/activation';
import { version as uuidVersion } from 'uuid';
import user from '../../../../../../src/models/user';
import { FEATURES_USER } from '../../../../../../src/types/user';
import webserver from '../../../../../../infra/webserver';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('PATCH /api/v1/activations/[tokenId]', () => {
	describe('Default user', () => {
		it('With valid token, but already logged in user', async () => {
			const user1 = await orchestrator.createUser();
			await orchestrator.activateUser(user1.id);
			const user1SessionObject = await orchestrator.createSession(user1.id);

			const user2 = await orchestrator.createUser();
			const user2ActivationToken = await activation.create(user2.id);

			const response = await fetch(
				`${webserver.getOrigin()}/api/v1/activations/${user2ActivationToken.id}`,
				{
					method: 'PATCH',
					headers: {
						Cookie: `session_id=${user1SessionObject.token}`
					}
				}
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'ForbiddenError',
				message: 'Usuário não possui permissão para executar esta ação.',
				action: 'Verifique se o seu usuário possui a feature "read:activation_token"',
				status_code: 403
			});
		});
	});

	describe('Anonymous user', () => {
		it('With nonexistent token', async () => {
			const response = await fetch(
				`${webserver.getOrigin()}/api/v1/activations/fd0bf59d-197b-4534-8b4b-b1608e694949`,
				{
					method: 'PATCH'
				}
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'NotFoundError',
				status_code: 404,
				message: 'O token de ativação utilizado não foi encontrado no sistema ou expirou.',
				action: 'Faça um novo cadastro.'
			});
		});

		it('With expired token', async () => {
			//volta o tempo para o passado, para criar um token expirado
			vi.useFakeTimers({
				now: new Date(Date.now() - activation.EXPIRATION_IN_MILLISECONDS)
			});

			const createdUser = await orchestrator.createUser();

			const expiredActivationToken = await activation.create(createdUser.id);

			//volta o tempo para o atual
			vi.useRealTimers();

			const response = await fetch(
				`${webserver.getOrigin()}/api/v1/activations/${expiredActivationToken.id}`,
				{
					method: 'PATCH'
				}
			);

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'NotFoundError',
				status_code: 404,
				message: 'O token de ativação utilizado não foi encontrado no sistema ou expirou.',
				action: 'Faça um novo cadastro.'
			});
		});

		it('With already used token', async () => {
			const createdUser = await orchestrator.createUser();
			const activationToken = await activation.create(createdUser.id);

			//primeiro uso do token
			const firstResponse = await fetch(
				`${webserver.getOrigin()}/api/v1/activations/${activationToken.id}`,
				{
					method: 'PATCH'
				}
			);

			expect(firstResponse.status).toBe(200);

			//segundo uso do token
			const secondResponse = await fetch(
				`${webserver.getOrigin()}/api/v1/activations/${activationToken.id}`,
				{
					method: 'PATCH'
				}
			);

			expect(secondResponse.status).toBe(404);

			const responseBody = await secondResponse.json();

			expect(responseBody).toEqual({
				name: 'NotFoundError',
				status_code: 404,
				message: 'O token de ativação utilizado não foi encontrado no sistema ou expirou.',
				action: 'Faça um novo cadastro.'
			});
		});

		it('With valid token', async () => {
			const createdUser = await orchestrator.createUser();
			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`${webserver.getOrigin()}/api/v1/activations/${activationToken.id}`,
				{
					method: 'PATCH'
				}
			);

			expect(response.status).toBe(200);

			const responseBody: TypeActivationToken = await response.json();

			expect(responseBody).toEqual({
				id: activationToken.id,
				used_at: responseBody.used_at,
				user_id: activationToken.user_id,
				created_at: new Date(activationToken.created_at).toISOString(),
				expires_at: new Date(activationToken.expires_at).toISOString(),
				updated_at: responseBody.updated_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(uuidVersion(responseBody.user_id)).toBe(4);

			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
			const updateAt = new Date(responseBody.updated_at).getMilliseconds();
			const createdAt1 = new Date(responseBody.expires_at).getMilliseconds();

			expect(updateAt > createdAt1).toBe(true);

			const expiresAt = new Date(responseBody.expires_at);
			const createdAt = new Date(responseBody.created_at);

			expiresAt.setMilliseconds(0);
			createdAt.setMilliseconds(0);

			expect(expiresAt.getTime() - createdAt.getTime()).toBe(activation.EXPIRATION_IN_MILLISECONDS);

			const activatedUser = await user.findOneById(responseBody.user_id);
			expect(activatedUser.features).toEqual([
				FEATURES_USER.CREATE_SESSION,
				FEATURES_USER.READ_SESSION,
				FEATURES_USER.UPDATE_USER
			]);
		});

		it('With valid token but already activated user', async () => {
			const createdUser = await orchestrator.createUser();
			await orchestrator.activateUser(createdUser.id);
			const activationToken = await activation.create(createdUser.id);

			const response = await fetch(
				`${webserver.getOrigin()}/api/v1/activations/${activationToken.id}`,
				{
					method: 'PATCH'
				}
			);

			expect(response.status).toBe(403);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'ForbiddenError',
				message: 'Você não pode mais utilizar tokens de ativação.',
				action: 'Entre em contato com o suporte.',
				status_code: 403
			});
		});
	});
});
