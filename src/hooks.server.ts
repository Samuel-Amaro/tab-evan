import type { Handle } from '@sveltejs/kit';
import controller from '../infra/controller';
import { FEATURES_USER } from './types/user';

//conceito middleware: (meio) e um software que atua como um intermediario entre duas aplicacoes ou componentes de software
//o objetivo e interceptar o fluxo entre duas etapas

export const handle: Handle = async ({ event, resolve }) => {
	// eslint-disable-next-line no-useless-escape
	const API_USERS_REGEX = /^\/api\/v1\/users\/[^\/]+$/;

	try {
		if (event.url.pathname === '/api/v1/sessions' && event.request.method === 'POST') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.CREATE_SESSION)) {
				return await resolve(event);
			}
		}

		if (event.url.pathname === '/api/v1/users' && event.request.method === 'GET') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.READ_SESSION)) {
				return await resolve(event);
			}
		}

		if (event.url.pathname.startsWith('/api/v1/activations') && event.request.method === 'PATCH') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.READ_ACTIVATION_TOKEN)) {
				return await resolve(event);
			}
		}

		if (event.url.pathname === '/api/v1/users' && event.request.method === 'POST') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.CREATE_USER)) {
				return await resolve(event);
			}
		}

		if (RegExp(API_USERS_REGEX).test(event.url.pathname) && event.request.method === 'PATCH') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.UPDATE_USER)) {
				return await resolve(event);
			}
		}

		if (event.url.pathname === '/api/v1/user' && event.request.method === 'GET') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.READ_SESSION)) {
				return await resolve(event);
			}
		}

		if (event.url.pathname === '/api/v1/sessions' && event.request.method === 'DELETE') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			return await resolve(event);
		}

		if (event.url.pathname === '/api/v1/migrations' && event.request.method === 'GET') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.READ_MIGRATION)) {
				return await resolve(event);
			}
		}

		if (event.url.pathname === '/api/v1/migrations' && event.request.method === 'POST') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.CREATE_MIGRATION)) {
				return await resolve(event);
			}
		}

		if (event.url.pathname === '/api/v1/status' && event.request.method === 'GET') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			return await resolve(event);
		}

		return await resolve(event);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};
