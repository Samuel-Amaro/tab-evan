import { json, type RequestHandler } from '@sveltejs/kit';
import controller from '../../../../../../infra/controller';
import activation from '../../../../../models/activation';

export const PATCH: RequestHandler = async ({ params }) => {
	try {
		const tokenId = params.tokenId;

		const validActivationToken = await activation.findOneValidById(tokenId as string);
		const usedActivationToken = await activation.markTokenAsUsed(tokenId as string);

		await activation.activateUserByUserId(validActivationToken.user_id);

		return json(usedActivationToken);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
