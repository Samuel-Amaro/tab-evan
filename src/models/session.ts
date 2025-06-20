import database from '../../infra/database';
import crypto from 'node:crypto';
import type { TypeSessions } from '../types/sessions';

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

const session = {
	create,
	EXPIRATION_IN_MILLISECONDS
};

export default session;
