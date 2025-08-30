import { beforeAll, describe, expect, it, vi } from 'vitest';
import orchestrator from '../../../../orchestrator';
import type { TypeUser } from '../../../../../src/types/user';
import { version as uuidVersion } from 'uuid';
import session from '../../../../../src/models/session';
import setCookieParser, { splitCookiesString } from 'set-cookie-parser';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/user', () => {
	describe('Default user', () => {
		it('With valid session', async () => {
			const createdUser = await orchestrator.createUser({
				username: 'UserWithValidSession'
			});

			const sessionObject = await orchestrator.createSession(createdUser.id);

			const response = await fetch('http://localhost:5173/api/v1/user', {
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});

			expect(response.status).toBe(200);

			const responseBody: TypeUser = await response.json();

			expect(responseBody).toEqual({
				id: createdUser.id,
				username: 'UserWithValidSession',
				email: createdUser.email,
				password: createdUser.password,
				created_at: new Date(createdUser.created_at).toISOString(),
				updated_at: new Date(createdUser.updated_at).toISOString()
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			//verifica se a sessão foi renovada
			//pega a sessão novamente
			//espera que a data de expiração e atualização sejam maiores que as anteriores
			//pois a sessão deve ser renovada a cada requisição válida
			const renewedSessionObject = await session.findOneValidByToken(sessionObject.token);

			expect(renewedSessionObject.expires_at > sessionObject.expires_at).toEqual(true);
			expect(renewedSessionObject.updated_at > sessionObject.updated_at).toEqual(true);

			//Set-Cookie deve ser enviado com o mesmo token e nova data de expiração
			const combinedCookieHeader = response.headers.get('Set-Cookie');
			const splitCookieHeaders = splitCookiesString(combinedCookieHeader ?? undefined);

			const parsedSetCookie = setCookieParser(splitCookieHeaders, {
				map: true
			});

			expect(parsedSetCookie.session_id).toEqual({
				name: 'session_id',
				value: renewedSessionObject.token,
				maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
				path: '/',
				httpOnly: true
			});
		});

		it('With nonexistent session', async () => {
			const nonexistentToken =
				'cbc86acc81b715cf3eabef43d67bd25bca6f1b0f892b1e52c4615e4ed29b8e953b806a310bf336d145351fab1d916a50';

			const response = await fetch('http://localhost:5173/api/v1/user', {
				headers: {
					Cookie: `session_id=${nonexistentToken}`
				}
			});

			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'UnauthorizedError',
				message: 'Usuário não possui sessão ativa.',
				action: 'Verifique se este usuário está logado e tente novamente.',
				status_code: 401
			});
		});

		it('With expired session', async () => {
			//volta o tempo para o passado, para criar uma sessão expirada
			vi.useFakeTimers({
				now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS)
			});

			const createdUser = await orchestrator.createUser({
				username: 'UserWithExpiredSession'
			});

			//cria a sessão que já nasce expirada
			//tudo no mesmo processo, então o tempo "viajado" é o mesmo
			const sessionObject = await orchestrator.createSession(createdUser.id);

			//volta o tempo para o atual
			vi.useRealTimers();

			const response = await fetch('http://localhost:5173/api/v1/user', {
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});

			expect(response.status).toBe(401);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				name: 'UnauthorizedError',
				message: 'Usuário não possui sessão ativa.',
				action: 'Verifique se este usuário está logado e tente novamente.',
				status_code: 401
			});
		});

		it('With session token not provided', async () => {
			const response = await fetch('http://localhost:5173/api/v1/user');

			expect(response.status).toBe(404);

			const responseBody = await response.json();

			expect(responseBody).toEqual({
				message: 'Token de sessão não informado.',
				action: 'Informe um token de sessão válido e tente novamente.',
				name: 'NotFoundError',
				status_code: 404
			});
		});

		it('With session close to expires', async () => {
			//volta o tempo para o passado, para criar uma sessão que já se passou mais da metade do tempo para expirar
			vi.useFakeTimers({
				now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS / 2)
			});

			const createdUser = await orchestrator.createUser();

			//cria a sessão que já nasceu perto de expirar
			//tudo no mesmo processo, então o tempo "viajado" é o mesmo
			const sessionObject = await orchestrator.createSession(createdUser.id);

			//volta o tempo para o atual
			vi.useRealTimers();

			const response = await fetch('http://localhost:5173/api/v1/user', {
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});

			expect(response.status).toBe(200);

			const cacheControlHeader = response.headers.get('Cache-Control');
			expect(cacheControlHeader).toBe('no-store, no-cache, must-revalidate, max-age=0');

			const responseBody: TypeUser = await response.json();

			expect(responseBody).toEqual({
				id: createdUser.id,
				username: createdUser.username,
				email: createdUser.email,
				password: createdUser.password,
				created_at: new Date(createdUser.created_at).toISOString(),
				updated_at: new Date(createdUser.updated_at).toISOString()
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

			//verifica se a sessão foi renovada
			//pega a sessão novamente
			//espera que a data de expiração e atualização sejam maiores que as anteriores
			//pois a sessão deve ser renovada a cada requisição válida
			const renewedSessionObject = await session.findOneValidByToken(sessionObject.token);

			expect(renewedSessionObject.expires_at > sessionObject.expires_at).toEqual(true);
			expect(renewedSessionObject.updated_at > sessionObject.updated_at).toEqual(true);

			//Set-Cookie deve ser enviado com o mesmo token e nova data de expiração
			const combinedCookieHeader = response.headers.get('Set-Cookie');
			const splitCookieHeaders = splitCookiesString(combinedCookieHeader ?? undefined);

			const parsedSetCookie = setCookieParser(splitCookieHeaders, {
				map: true
			});

			expect(parsedSetCookie.session_id).toEqual({
				name: 'session_id',
				value: renewedSessionObject.token,
				maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
				path: '/',
				httpOnly: true
			});
		});
	});
});
