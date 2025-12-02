import database from '../../infra/database';
import email from '../../infra/email';
import type { TypeActivationToken } from '../types/activation';
import type { TypeUser } from '../types/user';
import webserver from '../../infra/webserver';

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function sendEmailToUser(user: TypeUser, activationToken: TypeActivationToken) {
	await email.send({
		from: 'TabEvangelho <samuel.dev.front@gmail.com>',
		to: user.email,
		subject: 'Ative seu cadastro no TabEvangelho!',
		text: `${user.username}, clique no link abaixo para ativar seu cadastro no TabEvangelho:
${webserver.getOrigin()}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe TabEvangelho
  `
	});
}

async function create(userId: string) {
	const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
	const newToken = await runInsertQuery(userId, expiresAt);
	return newToken;

	async function runInsertQuery(userId: string, expiresAt: Date) {
		const results = await database.query({
			text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          * 
        ;
      `,
			values: [userId, expiresAt]
		});

		return results.rows[0] as TypeActivationToken;
	}
}

async function findOneByUserId(userId: string) {
	return await runSelectQuery(userId);

	async function runSelectQuery(userId: string) {
		const results = await database.query({
			text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT
          1
        ;
      `,
			values: [userId]
		});

		return results.rows[0] as TypeActivationToken;
	}
}

const activation = {
	sendEmailToUser,
	create,
	findOneByUserId
};

export default activation;
