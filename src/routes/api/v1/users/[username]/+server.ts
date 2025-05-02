import { json, type RequestHandler } from '@sveltejs/kit';
import user from '../../../../../models/user';
import controller from '../../../../../../infra/controller';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const username = params.username;

		const userFound = await user.findOneByUsername(username as string);

		return json(userFound);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
