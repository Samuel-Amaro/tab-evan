import { FEATURES_USER, type TypeUser } from '../types/user';

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

const authorization = {
	can
};

export default authorization;
