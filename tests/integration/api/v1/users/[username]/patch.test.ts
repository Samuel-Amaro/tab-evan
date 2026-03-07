import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../../../../orchestrator';
import { version as uuidVersion } from 'uuid';
import { FEATURES_USER, type TypeUser } from '../../../../../../src/types/user';
import user from '../../../../../../src/models/user';
import password from '../../../../../../src/models/password';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('PATCH /api/v1/users/[username]', () => {
	describe('Anonymous user', () => {
		it("With unique 'username'", async () => {
			const createdUser = await orchestrator.createUser();

			const response = await fetch(`http://localhost:5173/api/v1/users/${createdUser.username}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'uniqueUser2'
				})
			});

			expect(response.status).toBe(403);

			const responseBody: TypeUser = await response.json();

			expect(responseBody).toEqual({
				action: 'Verifique se o seu usuário possui a feature "update:user"',
				message: 'Usuário não possui permissão para executar esta ação.',
				name: 'ForbiddenError',
				status_code: 403
			});
		});
	});

	describe('Default user', () => {
		it("With nonexistent 'username'", async () => {
			const createdUser = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(createdUser.id);
			const sessionObject = await orchestrator.createSession(activatedUser.id);

			const response = await fetch('http://localhost:5173/api/v1/users/UsuarioInexistente', {
				method: 'PATCH',
				headers: {
					Cookie: `session_id=${sessionObject.token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: 'UsuarioInexistente'
				})
			});

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'NotFoundError',
				message: 'O username informando não foi encontrado no sistema.',
				action: 'Verifique se o username está digitado corretamente.',
				status_code: 404
			});
		});

		it("With duplicated 'username'", async () => {
			await orchestrator.createUser({
				username: 'user1'
			});

			const createdUser2 = await orchestrator.createUser({
				username: 'user2'
			});

			const activatedUser2 = await orchestrator.activateUser(createdUser2.id);
			const sessionObject2 = await orchestrator.createSession(activatedUser2.id);

			const response = await fetch('http://localhost:5173/api/v1/users/user2', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `session_id=${sessionObject2.token}`
				},
				body: JSON.stringify({
					username: 'user1'
				})
			});

			expect(response.status).toBe(400);

			const responseBody2 = await response.json();

			expect(responseBody2).toEqual({
				name: 'ValidationError',
				message: 'O username informado já está sendo utilizado.',
				action: 'Utilize outro username para realizar está operação.',
				status_code: 400
			});
		});

		it("With duplicated 'email'", async () => {
			await orchestrator.createUser({
				email: 'email1@email.com'
			});

			const createdUser2 = await orchestrator.createUser({
				email: 'email2@email.com'
			});
			const activatedUser2 = await orchestrator.activateUser(createdUser2.id);
			const sessionObject2 = await orchestrator.createSession(activatedUser2.id);

			const response = await fetch(`http://localhost:5173/api/v1/users/${createdUser2.username}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `session_id=${sessionObject2.token}`
				},
				body: JSON.stringify({
					email: 'email1@email.com'
				})
			});

			expect(response.status).toBe(400);

			const responseBody2 = await response.json();

			expect(responseBody2).toEqual({
				name: 'ValidationError',
				message: 'O e-mail informado já está sendo utilizado.',
				action: 'Utilize outro e-mail para realizar está operação.',
				status_code: 400
			});
		});

		it("With unique 'username'", async () => {
			const createdUser = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(createdUser.id);
			const sessionObject = await orchestrator.createSession(activatedUser.id);

			const response = await fetch(`http://localhost:5173/api/v1/users/${createdUser.username}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `session_id=${sessionObject.token}`
				},
				body: JSON.stringify({
					username: 'uniqueUser2'
				})
			});

			expect(response.status).toBe(200);

			const responseBody: TypeUser = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: 'uniqueUser2',
				email: createdUser.email,
				password: responseBody.password,
				features: [
					FEATURES_USER.CREATE_SESSION,
					FEATURES_USER.READ_SESSION,
					FEATURES_USER.UPDATE_USER
				],
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			expect(responseBody.updated_at > responseBody.created_at).toBe(true);
		});

		it("With unique 'email'", async () => {
			const createdUser = await orchestrator.createUser();
			const activatedUser = await orchestrator.activateUser(createdUser.id);
			const sessionObject = await orchestrator.createSession(activatedUser.id);

			const response = await fetch(`http://localhost:5173/api/v1/users/${createdUser.username}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `session_id=${sessionObject.token}`
				},
				body: JSON.stringify({
					email: 'uniqueEmail2@email.com'
				})
			});

			expect(response.status).toBe(200);

			const responseBody: TypeUser = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: createdUser.username,
				email: 'uniqueEmail2@email.com',
				password: responseBody.password,
				features: [
					FEATURES_USER.CREATE_SESSION,
					FEATURES_USER.READ_SESSION,
					FEATURES_USER.UPDATE_USER
				],
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			expect(responseBody.updated_at > responseBody.created_at).toBe(true);
		});

		it("With new 'password'", async () => {
			const createdUser = await orchestrator.createUser({
				password: 'newPassword1'
			});
			const activatedUser = await orchestrator.activateUser(createdUser.id);
			const sessionObject = await orchestrator.createSession(activatedUser.id);

			const response = await fetch(`http://localhost:5173/api/v1/users/${createdUser.username}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `session_id=${sessionObject.token}`
				},
				body: JSON.stringify({
					password: 'newPassword2'
				})
			});

			expect(response.status).toBe(200);

			const responseBody: TypeUser = await response.json();

			expect(responseBody).toEqual({
				id: responseBody.id,
				username: createdUser.username,
				email: createdUser.email,
				password: responseBody.password,
				features: [
					FEATURES_USER.CREATE_SESSION,
					FEATURES_USER.READ_SESSION,
					FEATURES_USER.UPDATE_USER
				],
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			expect(responseBody.updated_at > responseBody.created_at).toBe(true);

			const userInDatabase = await user.findOneByUsername(createdUser.username);
			const correctPasswordMatch = await password.compare('newPassword2', userInDatabase.password);
			const incorrectPasswordMatch = await password.compare(
				'newPassword1',
				userInDatabase.password
			);

			expect(correctPasswordMatch).toBe(true);
			expect(incorrectPasswordMatch).toBe(false);
		});
	});
});
