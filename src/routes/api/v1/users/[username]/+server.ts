import { json, type RequestHandler } from '@sveltejs/kit';
import user from '../../../../../models/user';
import controller from '../../../../../../infra/controller';
import type { TypeUserValues } from '../../../../../types/user';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const username = params.username;

		const userFound = await user.findOneByUsername(username as string);

		return json(userFound);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const username = params.username;

		const userInputValues: Partial<TypeUserValues> = await request.json();

		const updatedUser = await user.update(username as string, userInputValues);

		return json(updatedUser);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
