import { json, type RequestHandler } from '@sveltejs/kit';
import controller from '../../../../../infra/controller';
import authentication from '../../../../models/authentication';
import session from '../../../../models/session';
import authorization from '../../../../models/authorization';
import { FEATURES_USER } from '../../../../types/user';
import { ForbiddenError } from '../../../../../infra/errors';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const userInputValues: {
			email: string;
			password: string;
		} = await request.json();

		const userAuthenticate = await authentication.getAuthenticateUser(
			userInputValues.email,
			userInputValues.password
		);

		if (!authorization.can(userAuthenticate, FEATURES_USER.CREATE_SESSION)) {
			throw new ForbiddenError({
				message: 'Você não possui permissão para fazer login.',
				action: 'Contate o suporte caso você acredite que isso seja um erro.',
				cause: null
			});
		}

		const newSession = await session.create(userAuthenticate.id);

		return json(newSession, {
			status: 201,
			headers: {
				'Set-Cookie': `session_id=${newSession.token}; Path=/; Max-Age=${session.EXPIRATION_IN_MILLISECONDS / 1000};${import.meta.env.MODE === 'production' ? ' Secure=true;' : ''} HttpOnly=true;`
			}
		});
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	try {
		const sessionToken = cookies.get('session_id');

		const existingSession = await session.findOneValidByToken(sessionToken);
		const expiredSession = await session.expireById(existingSession.id);

		return json(expiredSession, {
			status: 200,
			headers: {
				'Set-Cookie': `session_id=invalid; Path=/; Max-Age=-1;${import.meta.env.MODE === 'production' ? ' Secure=true;' : ''} HttpOnly=true;`
			}
		});
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
