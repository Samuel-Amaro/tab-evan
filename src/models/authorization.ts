import type { FilterInputType } from '../types';
import { FEATURES_USER, type TypeUser } from '../types/user';
import type { OutputStatus } from '../types/status';
import { InternalServerError } from '../../infra/errors';

const availableFeatures = [
	//USER
	FEATURES_USER.CREATE_USER,
	FEATURES_USER.READ_USER,
	FEATURES_USER.READ_USER_SELF,
	FEATURES_USER.UPDATE_USER,
	FEATURES_USER.UPDATE_USER_OTHERS,

	//SESSION
	FEATURES_USER.CREATE_SESSION,
	FEATURES_USER.READ_SESSION,

	//ACTIVATION_TOKEN
	FEATURES_USER.READ_ACTIVATION_TOKEN,

	//MIGRATION
	FEATURES_USER.READ_MIGRATION,
	FEATURES_USER.CREATE_MIGRATION,

	//STATUS
	FEATURES_USER.READ_STATUS,
	FEATURES_USER.READ_STATUS_ALL
];

function can(user: TypeUser, featuresUserTryingToRequest: FEATURES_USER, resource?: TypeUser) {
	validateUser(user);
	validateFeature(featuresUserTryingToRequest);

	let authorized = false;

	if (user.features.includes(featuresUserTryingToRequest)) authorized = true;

	if (featuresUserTryingToRequest === FEATURES_USER.UPDATE_USER && resource) {
		authorized = false;

		if (user.id === resource.id || can(user, FEATURES_USER.UPDATE_USER_OTHERS)) {
			authorized = true;
		}
	}

	return authorized;
}

function filterOutput(user: TypeUser, input: FilterInputType) {
	validateUser(user);
	validateInput(input);

	const { feature, resource } = input;
	if (feature === FEATURES_USER.READ_USER) {
		return {
			id: resource.id,
			username: resource.username,
			features: resource.features,
			created_at: resource.created_at,
			updated_at: resource.updated_at
		};
	}

	if (feature === FEATURES_USER.READ_USER_SELF) {
		if (user.id === resource.id) {
			return {
				id: resource.id,
				username: resource?.username,
				email: resource?.email,
				features: resource?.features,
				created_at: resource.created_at,
				updated_at: resource.updated_at
			};
		}
	}

	if (feature === FEATURES_USER.READ_SESSION) {
		if (user.id === resource.user_id) {
			return {
				id: resource.id,
				token: resource.token,
				user_id: resource.user_id,
				created_at: resource.created_at,
				updated_at: resource.updated_at,
				expires_at: resource.expires_at
			};
		}
	}

	if (feature === FEATURES_USER.READ_ACTIVATION_TOKEN) {
		return {
			id: resource.id,
			user_id: resource.user_id,
			created_at: resource.created_at,
			updated_at: resource.updated_at,
			expires_at: resource.expires_at,
			used_at: resource.used_at
		};
	}

	if (feature === FEATURES_USER.READ_MIGRATION) {
		return resource.map((migration) => ({
			path: migration.path,
			name: migration.name,
			timestamp: migration.timestamp
		}));
	}

	if (feature === FEATURES_USER.READ_STATUS) {
		let output: OutputStatus = {
			updated_at: resource.updated_at,
			dependencies: {
				database: {
					max_connections: resource.dependencies.database.max_connections,
					opened_connections: resource.dependencies.database.opened_connections
				}
			}
		};

		if (can(user, FEATURES_USER.READ_STATUS_ALL)) {
			output = {
				updated_at: resource.updated_at,
				dependencies: {
					database: {
						max_connections: resource.dependencies.database.max_connections,
						opened_connections: resource.dependencies.database.opened_connections,
						version: resource.dependencies.database.version
					}
				}
			};
		}

		return output;
	}
}

function validateUser(user?: TypeUser) {
	if (!user || !user.features) {
		throw new InternalServerError({
			cause: 'È necessário fornecer `user` no model `authorization`.'
		});
	}
}

function validateFeature(feature?: FEATURES_USER) {
	if (!feature || !availableFeatures.includes(feature)) {
		throw new InternalServerError({
			cause: 'È necessário fornecer uma `feature` no model `authorization`.'
		});
	}
}

function validateInput(input?: FilterInputType) {
	if (!input || !input?.feature || !input?.resource) {
		throw new InternalServerError({
			cause: 'È necessário fornecer `input` object no model `authorization`.'
		});
	}
}

const authorization = {
	can,
	filterOutput
};

export default authorization;
