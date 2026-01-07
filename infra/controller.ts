import { json } from '@sveltejs/kit';
import {
	InternalServerError,
	MethodNotAllowedError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
	ForbiddenError
} from './errors';
import session from '../src/models/session';
import user from '../src/models/user';
import { FEATURES_USER, type TypeUser } from '../src/types/user';
import authorization from '../src/models/authorization';

const controller = {
	onNoMatchHandler: () => {
		const publicErrorObject = new MethodNotAllowedError();
		return json(publicErrorObject, {
			status: publicErrorObject.statusCode
		});
	},
	onErrorHandler: (error: unknown, statusCode?: number) => {
		if (
			error instanceof ValidationError ||
			error instanceof NotFoundError ||
			error instanceof ForbiddenError
		) {
			return json(error, {
				status: error?.statusCode
			});
		}

		if (error instanceof UnauthorizedError) {
			return json(error, {
				status: error?.statusCode,
				headers: {
					'Set-Cookie': `session_id=invalid; Path=/; Max-Age=-1;${import.meta.env.MODE === 'production' ? ' Secure=true;' : ''} HttpOnly=true;`
				}
			});
		}

		const publicErrorObject = new InternalServerError({
			cause: error,
			statusCode
		});

		console.error(publicErrorObject);

		return json(publicErrorObject, {
			status: publicErrorObject.statusCode
		});
	},
	injectAuthenticatedUser: async (sessionId: string) => {
		const sessionObject = await session.findOneValidByToken(sessionId);
		return await user.findOneById(sessionObject.user_id);
	},
	injectAnonymousUser: async (): Promise<TypeUser> => {
		const anonymousUser = {
			features: [
				FEATURES_USER.CREATE_SESSION,
				FEATURES_USER.CREATE_USER,
				FEATURES_USER.READ_ACTIVATION_TOKEN
			]
		};
		return anonymousUser as TypeUser;
	},
	injectAnonymousOrUser: async (sessionId?: string): Promise<TypeUser> => {
		// 1. Se o cookie `session_id` existe, injetar o usuário.
		if (sessionId) {
			return await controller.injectAuthenticatedUser(sessionId);
		}

		// 2. Se não existir, injetar um usuário anônimo.
		return await controller.injectAnonymousUser();
	},
	canRequest: (user: TypeUser, featuresUserTryingToRequest: FEATURES_USER): boolean => {
		if (authorization.can(user, featuresUserTryingToRequest)) {
			return true;
		}

		throw new ForbiddenError({
			message: 'Usuário não possui permissão para executar esta ação.',
			action: `Verifique se o seu usuário possui a feature "${featuresUserTryingToRequest}"`,
			cause: null
		});
	}
};

export default controller;
