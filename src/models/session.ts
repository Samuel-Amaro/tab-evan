import database from '../../infra/database';
import crypto from 'node:crypto';
import type { TypeSessions } from '../types/sessions';
import { NotFoundError, UnauthorizedError } from '../../infra/errors';

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; //30 dias

async function create(idUser: string) {
	const token = crypto.randomBytes(48).toString('hex');
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

	const newSession = await runInsertQuery(token, idUser, expiresAt);
	return newSession;

	async function runInsertQuery(token: string, userId: string, expiresAt: Date) {
		const results = await database.query({
			text: `
      INSERT INTO
        sessions (token, user_id, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING
        * 
      ;`,
			values: [token, userId, expiresAt]
		});

		return results.rows[0] as TypeSessions;
	}
}

async function findOneValidByToken(token: string | undefined) {
	if (token) {
		return await runSelectQuery(token);
	} else {
		throw new NotFoundError({
			message: 'Token de sessão não informado.',
			action: 'Informe um token de sessão válido e tente novamente.',
			cause: 'function findOneByValidByToken in model session'
		});
	}

	async function runSelectQuery(token: string) {
		const results = await database.query({
			text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
      AND
        expires_at > NOW()
      LIMIT
        1
      ;`,
			values: [token]
		});

		if (results.rowCount === 0) {
			throw new UnauthorizedError({
				message: 'Usuário não possui sessão ativa.',
				action: 'Verifique se este usuário está logado e tente novamente.',
				cause: 'function findOneByValidByToken in model session'
			});
		}

		return results.rows[0] as TypeSessions;
	}
}

async function renew(id: string) {
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

	return await runUpdateQuery(id, expiresAt);

	async function runUpdateQuery(idSession: string, expiresAt: Date) {
		const results = await database.query({
			text: `
      UPDATE
        sessions
      SET
        expires_at = $2,
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING
        *
      ;`,
			values: [idSession, expiresAt]
		});

		return results.rows[0] as TypeSessions;
	}
}

async function expireById(sessionId: string) {
	return await runUpdateQuery(sessionId);

	async function runUpdateQuery(sessionId: string) {
		const results = await database.query({
			text: `
      UPDATE
        sessions
      SET
        expires_at = created_at - interval '1 year',
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING
        *
      ;`,
			values: [sessionId]
		});

		return results.rows[0] as TypeSessions;
	}
}

const session = {
	create,
	EXPIRATION_IN_MILLISECONDS,
	findOneValidByToken,
	renew,
	expireById
};

export default session;
