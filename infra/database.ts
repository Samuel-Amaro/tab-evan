import modulePg from 'pg';
import { ServiceError } from './errors';

const { Client } = modulePg;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function query(queryObject: any) {
	let client: InstanceType<typeof Client> | undefined = undefined;

	try {
		client = await getNewClient();
		const result = await client.query(queryObject);
		return result;
	} catch (error) {
		const serviceErrorObject = new ServiceError({
			cause: error,
			message: 'Erro na conexão com o Banco ou na Query.'
		});
		throw serviceErrorObject;
	} finally {
		await client?.end();
	}
}

async function getNewClient() {
	const client = new Client({
		host: import.meta.env.POSTGRES_HOST,
		port: parseInt(import.meta.env.POSTGRES_PORT as string),
		user: import.meta.env.POSTGRES_USER,
		database: import.meta.env.POSTGRES_DB,
		password: import.meta.env.POSTGRES_PASSWORD as string,
		ssl: getSSLValues()
	});

	await client.connect();
	return client;
}

const database = {
	query,
	getNewClient
};

export default database;

function getSSLValues() {
	//CA === AUTORIDADE CERTIFICADO
	if (import.meta.env.POSTGRES_CA) {
		return {
			ca: import.meta.env.POSTGRES_CA
		};
	}

	return import.meta.env.MODE === 'production' ? true : false;
}
