import { beforeAll, describe, expect, it, vi } from 'vitest';
import orchestrator from '../../../../orchestrator';
import { version as uuidVersion } from 'uuid';
import session from '../../../../../src/models/session';
import setCookieParser, { splitCookiesString } from 'set-cookie-parser';
import type { TypeSessions } from '../../../../../src/types/sessions';
import type { TypeUser } from '../../../../../src/types/user';

beforeAll(async () => {
	await orchestrator.waitForAllServices();
	await orchestrator.clearDatabase();
	await orchestrator.runPendingMigrations();
});

describe('DELETE /api/v1/sessions', () => {
	describe('Default user', () => {
		it('With valid session', async () => {
			const createdUser = await orchestrator.createUser();

			const sessionObject = await orchestrator.createSession(createdUser.id);

			const response = await fetch('http://localhost:5173/api/v1/sessions', {
				method: 'DELETE',
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});

			expect(response.status).toBe(200);

			const responseBody: TypeSessions = await response.json();

			expect(responseBody).toEqual({
				id: sessionObject.id,
				token: sessionObject.token,
				user_id: sessionObject.user_id,
				created_at: responseBody.created_at,
				updated_at: responseBody.updated_at,
				expires_at: responseBody.expires_at
			});

			expect(uuidVersion(responseBody.id)).toBe(4);
			expect(Date.parse(responseBody.created_at)).not.toBeNaN();
			expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
			expect(Date.parse(responseBody.expires_at)).not.toBeNaN();

			expect(responseBody.expires_at < new Date(sessionObject.expires_at).toISOString()).toEqual(
				true
			);
			expect(responseBody.updated_at > new Date(sessionObject.updated_at).toISOString()).toEqual(
				true
			);

			//Set-Cookie deve ser enviado com o mesmo token e nova data de expiração
			const combinedCookieHeader = response.headers.get('Set-Cookie');
			const splitCookieHeaders = splitCookiesString(combinedCookieHeader ?? undefined);

			const parsedSetCookie = setCookieParser(splitCookieHeaders, {
				map: true
			});

			expect(parsedSetCookie.session_id).toEqual({
				name: 'session_id',
				value: 'invalid',
				maxAge: -1,
				path: '/',
				httpOnly: true
			});

			const doubleCheckResponse = await fetch('http://localhost:5173/api/v1/user', {
				headers: {
					Cookie: `session_id=${sessionObject.token}`
				}
			});

			expect(doubleCheckResponse.status).toBe(401);

			const doubleCheckResponseBody: TypeUser = await doubleCheckResponse.json();

			expect(doubleCheckResponseBody).toEqual({
				name: 'UnauthorizedError',
				message: 'Usuário não possui sessão ativa.',
				action: 'Verifique se este usuário está logado e tente novamente.',
				status_code: 401
			});
		});

		it('With nonexistent session', async () => {
			const nonexistentToken =
				'cbc86acc81b715cf3eabef43d67bd25bca6f1b0f892b1e52c4615e4ed29b8e953b806a310bf336d145351fab1d916a50';

			const response = await fetch('http://localhost:5173/api/v1/sessions', {
				method: 'DELETE',
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

			const response = await fetch('http://localhost:5173/api/v1/sessions', {
				method: 'DELETE',
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
	});
});
