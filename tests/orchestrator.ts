import retry from 'async-retry';
import migrator from '../src/models/migrator';
import database from '../src/infra/database';

/**
 * * Agurda todos os serviços estarem prontos
 */
async function waitForAllServices() {
	await waitForWebServer();

	async function waitForWebServer() {
		return retry(fetchStatusPage, {
			retries: 100,
			maxTimeout: 1000
		});

		async function fetchStatusPage() {
			const response = await fetch('http://localhost:5173/api/v1/status');

			if (response.status !== 200) {
				throw Error();
			}
		}
	}
}

async function clearDatabase() {
	await database.query('drop schema public cascade; create schema public;');
}

async function runPendingMigrations() {
	await migrator.runPendingMigrations();
}

export default {
	waitForAllServices,
	clearDatabase,
	runPendingMigrations
};
