import database from '../../infra/database';
import { NotFoundError, ValidationError } from '../../infra/errors';
import type { TypeUser, TypeUserValues } from '../types/user';
import password from './password';

async function create(values: TypeUserValues) {
	await validateUniqueUsername(values.username);
	await validateUniqueEmail(values.email);
	await hashPasswordInObject(values);

	const newUser = await runInsertQuery(values);
	return newUser;

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

async function hashPasswordInObject(values?: TypeUserValues, valuesOpt?: Partial<TypeUserValues>) {
	const hashedPassword = await password.hash(
		(values?.password as string) || (valuesOpt?.password as string)
	);
	//quando os values são obrigatorios no cadastro, informa os values com todos campos obrigatorios
	if (values) {
		values.password = hashedPassword;
	}

	//quando os values são opcionais na atualização, informa um objeto com todos campos opcionais
	if (valuesOpt) {
		valuesOpt.password = hashedPassword;
	}
}

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
			action: 'Utilize outro username para realizar está operação.',
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
			action: 'Utilize outro e-mail para realizar está operação.',
			cause: 'function validateUniqueEmail in model user function create'
		});
	}
}

async function findOneByUsername(username: string) {
	const userFound = await runSelectQuery(username);

	return userFound;

	async function runSelectQuery(username: string) {
		const results = await database.query({
			text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
			values: [username]
		});

		if (results.rowCount === 0) {
			throw new NotFoundError({
				message: 'O username informando não foi encontrado no sistema.',
				action: 'Verifique se o username está digitado corretamente.',
				cause: 'function findOneByUsername in model user'
			});
		}

		return results.rows[0] as TypeUser;
	}
}

async function findOneByEmail(email: string) {
	const userFound = await runSelectQuery(email);

	return userFound;

	async function runSelectQuery(email: string) {
		const results = await database.query({
			text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT
        1
      ;`,
			values: [email]
		});

		if (results.rowCount === 0) {
			throw new NotFoundError({
				message: 'O email informando não foi encontrado no sistema.',
				action: 'Verifique se o email está digitado corretamente.',
				cause: 'function findOneByemail in model user'
			});
		}

		return results.rows[0] as TypeUser;
	}
}

async function update(username: string, values: Partial<TypeUserValues>) {
	const currentUser = await findOneByUsername(username);

	if (values?.username) {
		await validateUniqueUsername(values.username);
	}

	if (values?.email) {
		await validateUniqueEmail(values?.email);
	}

	if (values?.password) {
		await hashPasswordInObject(undefined, values);
	}

	const userWitNewValues = { ...currentUser, ...values };

	const updatedUser = await runUpdateQuery(userWitNewValues);
	return updatedUser;

	async function runUpdateQuery(values: TypeUser) {
		const results = await database.query({
			text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
			values: [values.id, values.username, values.email, values.password]
		});

		return results.rows[0] as TypeUser;
	}
}

const user = {
	create,
	findOneByUsername,
	update,
	findOneByEmail
};

export default user;
