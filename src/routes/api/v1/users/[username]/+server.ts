import { json, type RequestHandler } from '@sveltejs/kit';
import user from '../../../../../models/user';
import controller from '../../../../../../infra/controller';
import { FEATURES_USER, type TypeUserValues } from '../../../../../types/user';
import authorization from '../../../../../models/authorization';
import { ForbiddenError } from '../../../../../../infra/errors';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const username = params.username;
		const userFound = await user.findOneByUsername(username as string);

		const securedOutputValues = authorization.filterOutput(locals.user, {
			feature: FEATURES_USER.READ_USER,
			resource: userFound
		});

		return json(securedOutputValues);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	try {
		const username = params.username;

		const userInputValues: Partial<TypeUserValues> = await request.json();

		//user, feature, resource
		const userTryingToPatch = locals.user;
		const targetUser = await user.findOneByUsername(username as string);

		if (!authorization.can(userTryingToPatch, FEATURES_USER.UPDATE_USER, targetUser)) {
			throw new ForbiddenError({
				cause: 'ForbiddenError',
				message: 'Você não possui permissão para atualizar outro usuário.',
				action: 'Verifique se você possui a feature necessária para atualizar outro usuário.'
			});
		}

		const updatedUser = await user.update(username as string, userInputValues);

		const securedOutputValues = authorization.filterOutput(userTryingToPatch, {
			feature: FEATURES_USER.READ_USER,
			resource: updatedUser
		});

		return json(securedOutputValues);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
