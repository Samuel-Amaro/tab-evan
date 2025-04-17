import { json } from '@sveltejs/kit';
import {
	InternalServerError,
	MethodNotAllowedError,
	ValidationError,
	NotFoundError
} from './errors';

const controller = {
	onNoMatchHandler: () => {
		const publicErrorObject = new MethodNotAllowedError();
		return json(publicErrorObject, {
			status: publicErrorObject.statusCode
		});
	},
	onErrorHandler: (error: unknown, statusCode?: number) => {
		if (error instanceof ValidationError || error instanceof NotFoundError) {
			return json(error, {
				status: error?.statusCode
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
	}
};

export default controller;
