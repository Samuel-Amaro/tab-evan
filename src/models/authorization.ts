import type { FEATURES_USER, TypeUser } from '../types/user';

function can(user: TypeUser, featuresUserTryingToRequest: FEATURES_USER) {
	return user.features.includes(featuresUserTryingToRequest);
}

const authorization = {
	can
};

export default authorization;
