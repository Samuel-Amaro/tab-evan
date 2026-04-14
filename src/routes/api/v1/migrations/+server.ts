import { json, type RequestHandler } from '@sveltejs/kit';
import migrator from '../../../../models/migrator';
import controller from '../../../../../infra/controller';
import authorization from '../../../../models/authorization';
import { FEATURES_USER } from '../../../../types/user';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const pendingMigrations = await migrator.listPendingMigrations();

		const secureOutputValues = authorization.filterOutput(locals.user, {
			feature: FEATURES_USER.READ_MIGRATION,
			resource: pendingMigrations
		});

		return json(secureOutputValues);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const POST: RequestHandler = async ({ locals }) => {
	try {
		const migratedMigrations = await migrator.runPendingMigrations();

		const secureOutputValues = authorization.filterOutput(locals.user, {
			feature: FEATURES_USER.READ_MIGRATION,
			resource: migratedMigrations
		});

		if (migratedMigrations.length > 0) {
			return json(secureOutputValues, { status: 201 });
		}

		return json(secureOutputValues);
	} catch (error) {
		return controller.onErrorHandler(error);
	}
};

export const fallback: RequestHandler = async () => {
	return controller.onNoMatchHandler();
};
