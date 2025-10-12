import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../orchestrator';
import type { TypeUser } from '../../../src/types/user';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
	await orchestrator.deleteAllEmails();
});

describe('Use case: Registration Flow (all successful)', () => {
	it('Create user account', async () => {
		const createUserResponse = await fetch('http://localhost:5173/api/v1/users', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: 'RegistrationFlow',
				email: 'registration.flow@curso.dev',
				password: 'RegistrationFlow123'
			})
		});

		expect(createUserResponse.status).toBe(201);

		const createUserResponseBody: TypeUser = await createUserResponse.json();

		expect(createUserResponseBody).toEqual({
			id: createUserResponseBody.id,
			username: 'RegistrationFlow',
			email: 'registration.flow@curso.dev',
			password: createUserResponseBody.password,
			//uma feature e composta pela ação:objeto:modificador
			//read: ação de ler, activation_token: objeto alvo
			features: ['read:activation_token'],
			createdAt: createUserResponseBody.created_at,
			updatedAt: createUserResponseBody.updated_at
		});
	});

	it('Receive activation email', async () => {});

	it('Activate account', async () => {});

	it('Login', async () => {});

	it('Get user information', async () => {});
});
