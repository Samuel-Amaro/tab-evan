import { resolve } from 'path';
import type { Client } from 'pg';
import runner, { type RunnerOption } from 'node-pg-migrate';
import database from '../../infra/database';
import { ServiceError } from '../../infra/errors';

function getOptions(client: Client, dryRun: boolean = false) {
	const defaultMigrationOptions: RunnerOption = {
		dbClient: client,
		dryRun: dryRun,
		dir: resolve('infra', 'migrations'),
		direction: 'up',
		log: () => {},
		migrationsTable: 'pgmigrations'
	};
	return defaultMigrationOptions;
}

async function listPendingMigrations() {
	let dbClient: Client | undefined;

	try {
		dbClient = await database.getNewClient();

		return await runner(getOptions(dbClient, true));
	} catch (error) {
		const serviceErrorObject = new ServiceError({
			cause: error,
			message: 'Erro ao executar a listagem das migrations pendentes no migration runner.'
		});
		throw serviceErrorObject;
	} finally {
		await dbClient?.end();
	}
}

async function runPendingMigrations() {
	let dbClient: Client | undefined;

	try {
		dbClient = await database.getNewClient();

		return await runner(getOptions(dbClient));
	} catch (error) {
		const serviceErrorObject = new ServiceError({
			cause: error,
			message: 'Erro ao executar as migrations pendentes no migration runner'
		});
		throw serviceErrorObject;
	} finally {
		await dbClient?.end();
	}
}

const migrator = {
	listPendingMigrations,
	runPendingMigrations
};

export default migrator;
