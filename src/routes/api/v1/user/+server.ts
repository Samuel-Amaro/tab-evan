import { json, type RequestHandler } from '@sveltejs/kit';
import controller from '../../../../../infra/controller';
import session from '../../../../models/session';
import user from '../../../../models/user';
import authorization from '../../../../models/authorization';
import { FEATURES_USER } from '../../../../types/user';

export const GET: RequestHandler = async ({ cookies, locals }) => {
	try {
		const userTryingToGet = locals.user;

		const sessionToken = cookies.get('session_id');

		const sessionObject = await session.findOneValidByToken(sessionToken);
		const renewedSessionObject = await session.renew(sessionObject.id);

		const userFound = await user.findOneById(sessionObject.user_id);

		const securedOutputValues = authorization.filterOutput(userTryingToGet, {
			feature: FEATURES_USER.READ_USER_SELF,
			resource: userFound
		});

		return json(securedOutputValues, {
			headers: {
				'Set-Cookie': `session_id=${renewedSessionObject.token}; Path=/; Max-Age=${session.EXPIRATION_IN_MILLISECONDS / 1000};${import.meta.env.MODE === 'production' ? ' Secure=true;' : ''} HttpOnly=true;`,
				'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
			}
		});
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};
