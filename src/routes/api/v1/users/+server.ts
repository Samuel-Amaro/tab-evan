import { json, type RequestHandler } from '@sveltejs/kit';
import user from '../../../../models/user';
import controller from '../../../../../infra/controller';
import activation from '../../../../models/activation';
import authorization from '../../../../models/authorization';
import { FEATURES_USER } from '../../../../types/user';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const useInputValues: {
			username: string;
			email: string;
			password: string;
		} = await request.json();
		const userTryingToPost = locals.user;

		const newUser = await user.create(useInputValues);

		const activationToken = await activation.create(newUser.id);
		await activation.sendEmailToUser(newUser, activationToken);

		const securedOutputValues = authorization.filterOutput(userTryingToPost, {
			feature: FEATURES_USER.READ_USER,
			resource: newUser
		});

		return json(securedOutputValues, {
			status: 201
		});
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
