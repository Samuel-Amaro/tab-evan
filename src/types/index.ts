export interface ErrorInterface {
	cause: unknown;
	message?: string;
	statusCode?: number;
	action?: string;
}

