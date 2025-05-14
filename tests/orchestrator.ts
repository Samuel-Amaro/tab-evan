import retry from 'async-retry';
import { faker } from '@faker-js/faker';
import migrator from '../src/models/migrator';
import database from '../infra/database';
import type { TypeUserValues } from '../src/types/user';
import user from '../src/models/user';

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

async function createUser(userObj?: Partial<TypeUserValues>) {
	return await user.create({
		username: userObj?.username || faker.internet.username().replace(/[_.-]/g, ''),
		email: userObj?.email || faker.internet.email(),
		password: userObj?.password || faker.internet.password()
	});
}

export default {
	waitForAllServices,
	clearDatabase,
	runPendingMigrations,
	createUser
};
