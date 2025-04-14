import database from '../../infra/database';
import { ValidationError } from '../../infra/errors';
import type { TypeUser, TypeUserValues } from '../types/user';

async function create(values: TypeUserValues) {
	await validateUniqueEmail(values.email);
	await validateUniqueUsername(values.username);

	const newUser = await runInsertQuery(values);
	return newUser;

	async function validateUniqueUsername(username: string) {
		const results = await database.query({
			text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
			values: [username]
		});

		if (results.rowCount > 0) {
			throw new ValidationError({
				message: 'O username informado já está sendo utilizado.',
				action: 'Utilize outro username para realizar o cadastro.',
				cause: 'function validateUniqueUsername in model user function create'
			});
		}
	}

	async function validateUniqueEmail(email: string) {
		const results = await database.query({
			text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
			values: [email]
		});

		if (results.rowCount > 0) {
			throw new ValidationError({
				message: 'O e-mail informado já está sendo utilizado.',
				action: 'Utilize outro e-mail para realizar o cadastro.',
				cause: 'function validateUniqueEmail in model user function create'
			});
		}
	}

	async function runInsertQuery(values: TypeUserValues) {
		const results = await database.query({
			text: `
      INSERT INTO
        users (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        * 
      ;`,
			values: [values.username, values.email, values.password]
		});

		return results.rows[0] as TypeUser;
	}
}

const user = {
	create
};

export default user;
