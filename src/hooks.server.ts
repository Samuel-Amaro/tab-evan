import type { Handle } from '@sveltejs/kit';
import controller from '../infra/controller';
import { FEATURES_USER } from './types/user';

//conceito middleware: (meio) e um software que atua como um intermediario entre duas aplicacoes ou componentes de software
//o objetivo e interceptar o fluxo entre duas etapas

export const handle: Handle = async ({ event, resolve }) => {
	try {
		if (event.url.pathname.startsWith('/api/v1/sessions') && event.request.method === 'POST') {
			const userFound = await controller.injectAnonymousOrUser(event.cookies.get('session_id'));

			event.locals = {
				...event.locals,
				user: userFound
			};

			if (controller.canRequest(userFound, FEATURES_USER.CREATE_SESSION)) {
				return await resolve(event);
			}
		}

		return await resolve(event);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};
