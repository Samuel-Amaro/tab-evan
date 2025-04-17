import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../../orchestrator';
import type { TypeUser } from '../../../../../../src/types/user';
import { version as uuidVersion } from 'uuid';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/users/[username]', () => {
	describe('Anonymous user', () => {
		it('With exact case match', async () => {
			const response1 = await fetch('http://localhost:5173/api/v1/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'MesmoCase',
					email: 'mesmo.case@email.com',
					password: 'senha123'
				})
			});

			expect(response1.status).toBe(201);

			const response2 = await fetch('http://localhost:5173/api/v1/users/MesmoCase');

			expect(response2.status).toBe(200);

			const responseBody: TypeUser = await response2.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: 'MesmoCase',
				email: 'mesmo.case@email.com',
				password: 'senha123',
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
		});

		it('With case mismatch', async () => {
			const response1 = await fetch('http://localhost:5173/api/v1/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'CaseDiferente',
					email: 'case.diferente@email.com',
					password: 'senha123'
				})
			});

			expect(response1.status).toBe(201);

			const response2 = await fetch('http://localhost:5173/api/v1/users/casediferente');

			expect(response2.status).toBe(200);

			const responseBody: TypeUser = await response2.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: 'CaseDiferente',
				email: 'case.diferente@email.com',
				password: 'senha123',
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
		});

		it('With nonexistent username', async () => {
			const response = await fetch('http://localhost:5173/api/v1/users/UsuarioInexistente');

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'NotFoundError',
				message: 'O username informando não foi encontrado no sistema.',
				action: 'Verifique se o username está digitado corretamente.',
				status_code: 404
			});
		});
	});
});
