export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
	pgm.createTable('users', {
		id: {
			type: 'uuid',
			primaryKey: true,
			default: pgm.func('gen_random_uuid()')
		},
		//para referencia, o github limita nome de usuarios a 39 caracteres
		username: {
			type: 'varchar(30)',
			notNull: true,
			unique: true
		},
		email: {
			type: 'varchar(254)',
			notNull: true,
			unique: true
		},
		password: {
			type: 'varchar(60)',
			notNull: true
		},
		created_at: {
			type: 'timestamptz',
			default: pgm.func("timezone('utc', now())"),
			notNull: true
		},
		updated_at: {
			type: 'timestamptz',
			default: pgm.func("timezone('utc', now())"),
			notNull: true
		}
	});
};

export const down = false;
