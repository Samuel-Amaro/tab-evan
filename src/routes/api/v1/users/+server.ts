import { json, type RequestHandler } from '@sveltejs/kit';
import user from '../../../../models/user';
import controller from '../../../../../infra/controller';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const useInputValues: {
			username: string;
			email: string;
			password: string;
		} = await request.json();

		const newUser = await user.create(useInputValues);

		return json(newUser, {
			status: 201
		});
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
