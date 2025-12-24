import database from '../../infra/database';
import email from '../../infra/email';
import type { TypeActivationToken } from '../types/activation';
import { FEATURES_USER, type TypeUser } from '../types/user';
import webserver from '../../infra/webserver';
import { NotFoundError } from '../../infra/errors';
import user from './user';

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneValidById(tokenId: string) {
	return await runSelectQuery(tokenId);

	async function runSelectQuery(tokenId: string) {
		const results = await database.query({
			text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND
            expires_at > NOW()
          AND
            used_at IS NULL
        LIMIT
          1
        ;
      `,
			values: [tokenId]
		});

		if (results.rowCount === 0) {
			throw new NotFoundError({
				cause: 'validação de token',
				message: 'O token de ativação utilizado não foi encontrado no sistema ou expirou.',
				action: 'Faça um novo cadastro.'
			});
		}

		return results.rows[0] as TypeActivationToken;
	}
}

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

async function markTokenAsUsed(activationTokenId: string) {
	return await runUpdateQuery(activationTokenId);

	async function runUpdateQuery(activationTokenId: string) {
		const results = await database.query({
			text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
        ;
      `,
			values: [activationTokenId]
		});

		return results.rows[0] as TypeActivationToken;
	}
}

async function activateUserByUserId(userId: string) {
	const activateUser = await user.setFeatures(userId, [FEATURES_USER.CREATE_SESSION]);
	return activateUser;
}

const activation = {
	sendEmailToUser,
	create,
	findOneValidById,
	markTokenAsUsed,
	activateUserByUserId
};

export default activation;
