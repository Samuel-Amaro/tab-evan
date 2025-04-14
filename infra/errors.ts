import type { ErrorInterface } from '../src/types';

export class InternalServerError extends Error {
	action: string;
	statusCode: number;

	constructor({ cause, statusCode }: ErrorInterface) {
		super('Um erro interno não esperado aconteceu.', {
			cause
		});

		this.name = 'InternalServerError';
		this.action = 'Entre em contato com o suporte.';
		this.statusCode = statusCode || 500;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode
		};
	}
}

export class ServiceError extends Error {
	action: string;
	statusCode: number;

	constructor({ cause, message }: ErrorInterface) {
		super(message || 'Serviço indisponível no momento.', {
			cause
		});

		this.name = 'ServiceError';
		this.action = 'Verifique se o serviço está disponível.';
		this.statusCode = 503;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode
		};
	}
}

export class MethodNotAllowedError extends Error {
	action: string;
	statusCode: number;

	constructor() {
		super('Método não permitido para este endpoint.');

		this.name = 'MethodNotAllowedError';
		this.action = 'Verifique se o método HTTP enviado é válido para este endpoint.';
		this.statusCode = 405;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode
		};
	}
}

export class ValidationError extends Error {
	action: string;
	statusCode: number;

	constructor({ cause, message, action }: ErrorInterface) {
		super(message || 'Um erro de validação ocorreu.', {
			cause
		});

		this.name = 'ValidationError';
		this.action = action || 'Ajuste os dados enviados e tente novamente.';
		this.statusCode = 400;
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			action: this.action,
			status_code: this.statusCode
		};
	}
}
