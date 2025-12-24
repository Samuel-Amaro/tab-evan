import { beforeAll, describe, expect, it } from 'vitest';
import orchestrator from '../../orchestrator';
import { FEATURES_USER, type TypeUser } from '../../../src/types/user';
import activation from '../../../src/models/activation';
import webserver from '../../../infra/webserver';
import user from '../../../src/models/user';
import type { TypeActivationToken } from '../../../src/types/activation';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('Use case: Registration Flow (all successful)', () => {
	let createUserResponseBody: TypeUser;
	let activationTokenId: string | null;

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
		expect(activatedUser.features).toEqual([FEATURES_USER.CREATE_SESSION]);
	});

	it('Login', async () => {});

	it('Get user information', async () => {});
});
