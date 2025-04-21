import { json, type RequestHandler } from '@sveltejs/kit';
import migrator from '../../../../models/migrator';
import controller from '../../../../infra/controller';

export const GET: RequestHandler = async () => {
	try {
		return json(await migrator.listPendingMigrations());
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const POST: RequestHandler = async () => {
	try {
		const migratedMigrations = await migrator.runPendingMigrations();

		if (migratedMigrations.length > 0) {
			return json(migratedMigrations, { status: 201 });
		}

		return json(migratedMigrations);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
