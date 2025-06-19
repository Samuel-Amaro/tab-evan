import { NotFoundError, UnauthorizedError } from '../../infra/errors';
import type { TypeUser } from '../types/user';
import password from './password';
import user from './user';

async function getAuthenticateUser(providedEmail: string, providedPassword: string) {
	try {
		const storedUser = await findUserByEmail(providedEmail);

		await validatePassword(providedPassword, storedUser.password);

		return storedUser;
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			throw new UnauthorizedError({
				cause: error,
				message: 'Dados de autenticação não conferem.',
				action: 'Verifique se os dados enviados estão corretos.'
			});
		}

		throw error;
	}

	async function findUserByEmail(providedEmail: string) {
		let storedUser: TypeUser | null = null;

		try {
			storedUser = await user.findOneByEmail(providedEmail);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw new UnauthorizedError({
					cause: error,
					message: 'Email não confere.',
					action: 'Verifique se este dado está correto.'
				});
			}

			throw error;
		}

		return storedUser;
	}

	async function validatePassword(providedPassword: string, storedPassword: string) {
		const correctPasswordMatch = await password.compare(providedPassword, storedPassword);

		if (!correctPasswordMatch) {
			throw new UnauthorizedError({
				cause: '',
				message: 'Senha não confere.',
				action: 'Verifique se este dado está correto.'
			});
		}
	}
}

const authentication = {
	getAuthenticateUser
};

export default authentication;
