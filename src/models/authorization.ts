import type { FilterInputType } from '../types';
import { FEATURES_USER, type TypeUser } from '../types/user';
import type { OutputStatus } from '../types/status';

function can(user: TypeUser, featuresUserTryingToRequest: FEATURES_USER, resource?: TypeUser) {
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

const authorization = {
	can,
	filterOutput
};

export default authorization;
