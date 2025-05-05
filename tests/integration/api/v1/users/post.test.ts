import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../orchestrator';
import type { TypeUser } from '../../../../../src/types/user';
import { version as uuidVersion } from 'uuid';
import user from '../../../../../src/models/user';
import password from '../../../../../src/models/password';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/users', () => {
	describe('Anonymous user', () => {
		it('With unique and valid data', async () => {
			const response = await fetch('http://localhost:5173/api/v1/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'samuelamaro',
					email: 'teste@email.com',
					password: 'senha123'
				})
			});

			expect(response.status).toBe(201);

			const responseBody: TypeUser = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: 'samuelamaro',
				email: 'teste@email.com',
				password: responseBody.password,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			const userInDatabase = await user.findOneByUsername('samuelamaro');
			const correctPasswordMatch = await password.compare('senha123', userInDatabase.password);
			const incorrectPasswordMatch = await password.compare('SenhaErrada', userInDatabase.password);

			expect(correctPasswordMatch).toBe(true);
			expect(incorrectPasswordMatch).toBe(false);
		});

		it("With duplicated 'email'", async () => {
			const response1 = await fetch('http://localhost:5173/api/v1/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'emailduplicado1',
					email: 'duplicado@email.com',
					password: 'senha123'
				})
			});

			expect(response1.status).toBe(201);

			const response2 = await fetch('http://localhost:5173/api/v1/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'emailduplicado2',
					email: 'Duplicado@email.com',
					password: 'senha123'
				})
			});

			expect(response2.status).toBe(400);

			const responseBody2 = await response2.json();

			expect(responseBody2).toEqual({
				name: 'ValidationError',
				message: 'O e-mail informado já está sendo utilizado.',
				action: 'Utilize outro e-mail para realizar está operação.',
				status_code: 400
			});
		});

		it("With duplicated 'username'", async () => {
			const response1 = await fetch('http://localhost:5173/api/v1/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'usernameduplicado',
					email: 'usernameduplicado1@email.com',
					password: 'senha123'
				})
			});

			expect(response1.status).toBe(201);

			const response2 = await fetch('http://localhost:5173/api/v1/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'usernameDuplicado',
					email: 'usernameduplicado2@email.com',
					password: 'senha123'
				})
			});

			expect(response2.status).toBe(400);

			const responseBody2 = await response2.json();

			expect(responseBody2).toEqual({
				name: 'ValidationError',
				message: 'O username informado já está sendo utilizado.',
				action: 'Utilize outro username para realizar está operação.',
				status_code: 400
			});
		});
	});
});
