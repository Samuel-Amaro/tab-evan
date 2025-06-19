export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
	pgm.createTable('sessions', {
		id: {
			type: 'uuid',
			primaryKey: true,
			default: pgm.func('gen_random_uuid()')
		},
		token: {
			type: 'varchar(96)',
			notNull: true,
			unique: true
		},
		user_id: {
			type: 'uuid',
			notNull: true
		},
		expires_at: {
			type: 'timestamptz',
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
