import { json, type RequestHandler } from '@sveltejs/kit';
import controller from '../../../../../infra/controller';
import session from '../../../../models/session';
import user from '../../../../models/user';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const sessionToken = cookies.get('session_id');

		const sessionObject = await session.findOneValidByToken(sessionToken);
		const renewedSessionObject = await session.renew(sessionObject.id);

		const userFound = await user.findOneById(sessionObject.user_id);

		return json(userFound, {
			headers: {
				'Set-Cookie': `session_id=${renewedSessionObject.token}; Path=/; Max-Age=${session.EXPIRATION_IN_MILLISECONDS / 1000};${import.meta.env.MODE === 'production' ? ' Secure=true;' : ''} HttpOnly=true;`
			}
		});
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};
