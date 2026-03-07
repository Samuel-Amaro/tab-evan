import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../orchestrator';
import { FEATURES_USER, type TypeUser } from '../../../src/types/user';
import activation from '../../../src/models/activation';
import webserver from '../../../infra/webserver';
import user from '../../../src/models/user';
import type { TypeActivationToken } from '../../../src/types/activation';
import type { TypeSessions } from '../../../src/types/sessions';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('Use case: Registration Flow (all successful)', () => {
	let createUserResponseBody: TypeUser;
	let activationTokenId: string | null;
	let createSessionResponseBody: TypeSessions;

	it('Create user account', async () => {
		await orchestrator.deleteAllEmails();

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

		createUserResponseBody = await createUserResponse.json();

		expect(createUserResponseBody).toEqual({
			id: createUserResponseBody.id,
			username: 'RegistrationFlow',
			email: 'registration.flow@curso.dev',
			password: createUserResponseBody.password,
			//uma feature e composta pela ação:objeto:modificador
			//read: ação de ler, activation_token: objeto alvo
			features: [FEATURES_USER.READ_ACTIVATION_TOKEN],
			created_at: createUserResponseBody.created_at,
			updated_at: createUserResponseBody.updated_at
		});
	});

	it('Receive activation email', async () => {
		const lastEmail = await orchestrator.getLastEmail();

		expect(lastEmail?.sender).toBe('<samuel.dev.front@gmail.com>');
		expect(lastEmail?.recipients[0]).toBe('<registration.flow@curso.dev>');
		expect(lastEmail?.subject).toBe('Ative seu cadastro no TabEvangelho!');
		expect(lastEmail?.text).toContain('RegistrationFlow');

		activationTokenId = orchestrator.extractUUID(lastEmail?.text as string);

		expect(lastEmail?.text).toContain(
			`${webserver.getOrigin()}/cadastro/ativar/${activationTokenId}`
		);

		const activationTokenObject = await activation.findOneValidById(activationTokenId as string);

		expect(activationTokenObject.user_id).toBe(createUserResponseBody.id);
		expect(activationTokenObject.used_at).toBe(null);
	});

	it('Activate account', async () => {
		const activationResponse = await fetch(
			`http://localhost:5173/api/v1/activations/${activationTokenId}`,
			{
				method: 'PATCH'
			}
		);

		expect(activationResponse.status).toBe(200);

		const activationResponseBody: TypeActivationToken = await activationResponse.json();

		expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

		const activatedUser = await user.findOneByUsername('RegistrationFlow');
		expect(activatedUser.features).toEqual([
			FEATURES_USER.CREATE_SESSION,
			FEATURES_USER.READ_SESSION,
			FEATURES_USER.UPDATE_USER
		]);
	});

	it('Login', async () => {
		const createSessionResponse = await fetch('http://localhost:5173/api/v1/sessions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: 'registration.flow@curso.dev',
				password: 'RegistrationFlow123'
			})
		});

		expect(createSessionResponse.status).toBe(201);

		createSessionResponseBody = await createSessionResponse.json();

		expect(createSessionResponseBody.user_id).toBe(createUserResponseBody.id);
	});

	it('Get user information', async () => {
		const userResponse = await fetch('http://localhost:5173/api/v1/user', {
			headers: {
				Cookie: `session_id=${createSessionResponseBody.token}`
			}
		});

		expect(userResponse.status).toBe(200);

		const userResponseBody: TypeUser = await userResponse.json();

		expect(userResponseBody.id).toBe(createUserResponseBody.id);
	});
});
