import { json } from '@sveltejs/kit';
import { InternalServerError, MethodNotAllowedError, ValidationError } from './errors';

const controller = {
	onNoMatchHandler: () => {
		const publicErrorObject = new MethodNotAllowedError();
		return json(publicErrorObject, {
			status: publicErrorObject.statusCode
		});
	},
	onErrorHandler: (error: unknown, statusCode?: number) => {
		if (error instanceof ValidationError) {
			return json(error, {
				status: error?.statusCode
			});
		}

		const publicErrorObject = new InternalServerError({
			cause: error,
			statusCode
		});

		return json(publicErrorObject, {
			status: publicErrorObject.statusCode
		});
	}
};

export default controller;
