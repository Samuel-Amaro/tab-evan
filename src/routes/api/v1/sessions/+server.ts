import { json, type RequestHandler } from '@sveltejs/kit';
import controller from '../../../../../infra/controller';
import authentication from '../../../../models/authentication';
import session from '../../../../models/session';

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

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
