import { json, type RequestHandler } from '@sveltejs/kit';
import controller from '../../../../../../infra/controller';
import activation from '../../../../../models/activation';
import authorization from '../../../../../models/authorization';
import { FEATURES_USER } from '../../../../../types/user';

export const PATCH: RequestHandler = async ({ params, locals }) => {
	try {
		const tokenId = params.tokenId;

		const validActivationToken = await activation.findOneValidById(tokenId as string);

		await activation.activateUserByUserId(validActivationToken.user_id);

		const usedActivationToken = await activation.markTokenAsUsed(tokenId as string);

		const securedOutputValues = authorization.filterOutput(locals.user, {
			feature: FEATURES_USER.READ_ACTIVATION_TOKEN,
			resource: usedActivationToken
		});

		return json(securedOutputValues);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
