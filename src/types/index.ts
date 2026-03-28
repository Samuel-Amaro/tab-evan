import type { RunMigration } from 'node-pg-migrate/dist/migration';
import type { TypeActivationToken } from './activation';
import type { TypeSessions } from './sessions';
import type { FEATURES_USER, TypeUser } from './user';
import type { Status } from './status';

export interface ErrorInterface {
	cause: unknown;
	message?: string;
	statusCode?: number;
	action?: string;
}

export type FilterInputType =
	| { feature: FEATURES_USER.READ_USER; resource: TypeUser }
	| { feature: FEATURES_USER.READ_USER_SELF; resource: TypeUser }
	| { feature: FEATURES_USER.READ_SESSION; resource: TypeSessions }
	| { feature: FEATURES_USER.READ_ACTIVATION_TOKEN; resource: TypeActivationToken }
	| { feature: FEATURES_USER.READ_MIGRATION; resource: RunMigration[] }
	| { feature: FEATURES_USER.READ_STATUS; resource: Status };
