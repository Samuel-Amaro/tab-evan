import path from 'path';
import type { Client } from 'pg';
import runner, { type RunnerOption } from 'node-pg-migrate';
import database from '../../infra/database';
import { ServiceError } from '../../infra/errors';

/**
 * ! FIX: ESTA OCORRENDO ERRO NA LEITURA DAS MIGRATIONS NA PRODUÇÃO ATRAVES DO ENDPOINT
 *
 * O caminho para ler os arquivos das migrations na produção não esta acessivel não e possivel encontrar o dir das migrations na produção apos o build, a pasta esta sendo copiada estaticamente mas mesmo assim o path para chegar até ela não e possivel.
 * Devido a esse cenario para rodar as migrations na produção e fazer o build localmente aqui e executar a preview e fazer a request no endpoint /migrations para executar as migrations via insomnia ou postman.
 */

function getOptions(client: Client, dryRun: boolean = false) {
	const defaultMigrationOptions: RunnerOption = {
		dbClient: client,
		dryRun: dryRun,
		dir: path.join(process.cwd(), 'infra', 'migrations'),
		direction: 'up',
		log: console.error,
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
