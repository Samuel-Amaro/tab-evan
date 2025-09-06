import { json } from '@sveltejs/kit';
import {
	InternalServerError,
	MethodNotAllowedError,
	NotFoundError,
	UnauthorizedError,
	ValidationError
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

		if (error instanceof UnauthorizedError) {
			return json(error, {
				status: error?.statusCode,
				headers: {
					'Set-Cookie': `session_id=invalid; Path=/; Max-Age=-1;${import.meta.env.MODE === 'production' ? ' Secure=true;' : ''} HttpOnly=true;`
				}
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
