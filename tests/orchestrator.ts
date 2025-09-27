import retry from 'async-retry';
import { faker } from '@faker-js/faker';
import migrator from '../src/models/migrator';
import database from '../infra/database';
import type { TypeUserValues } from '../src/types/user';
import user from '../src/models/user';
import session from '../src/models/session';
import type { TypeEmailValues, TypeEmailValuesBody } from '../src/types/email';

const emailHttpUrl = `http://${import.meta.env.EMAIL_HTTP_HOST}:${import.meta.env.EMAIL_HTTP_PORT}`;

/**
 * * Agurda todos os serviços estarem prontos
 */
async function waitForAllServices() {
	await waitForWebServer();
	await waitForEmailServer();

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

	async function waitForEmailServer() {
		return retry(fetchEmailPage, {
			retries: 100,
			maxTimeout: 1000
		});

		async function fetchEmailPage() {
			const response = await fetch(emailHttpUrl);

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

async function createSession(userId: string) {
	return await session.create(userId);
}

async function deleteAllEmails() {
	await fetch(`${emailHttpUrl}/messages`, {
		method: 'DELETE'
	});
}

async function getLastEmail(): Promise<TypeEmailValuesBody> {
	const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
	const emailListBody: TypeEmailValues[] = await emailListResponse.json();
	const lastEmailItem = emailListBody[emailListBody.length - 1];

	const emailTextResponse = await fetch(`${emailHttpUrl}/messages/${lastEmailItem?.id}.plain`);
	const emailTextBody = await emailTextResponse.text();

	return {
		...lastEmailItem,
		text: emailTextBody
	};
}

export default {
	waitForAllServices,
	clearDatabase,
	runPendingMigrations,
	createUser,
	createSession,
	deleteAllEmails,
	getLastEmail
};
