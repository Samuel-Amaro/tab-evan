import { describe, expect, it } from 'vitest';
import authorization from '../../../src/models/authorization';
import { InternalServerError } from '../../../infra/errors';
import { FEATURES_USER } from '../../../src/types/user';

describe('models/authorization', () => {
	describe('can', () => {
		it('without `user`', () => {
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				authorization.can();
			}).toThrow(InternalServerError);
		});

		it('without `user.features`', () => {
			const createdUser = {
				username: 'UserSemFeatures'
			};

			expect(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				authorization.can(createdUser);
			}).toThrow(InternalServerError);
		});

		it('without unknow `feature`', () => {
			const createdUser = {
				features: []
			};

			expect(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				authorization.can(createdUser, 'unknow_feature');
			}).toThrow(InternalServerError);
		});

		it('with valid `user` and known `feature`', () => {
			const createdUser = {
				features: [FEATURES_USER.CREATE_USER]
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-expect-error
			expect(authorization.can(createdUser, FEATURES_USER.CREATE_USER)).toBe(true);
		});
	});

	describe('filterOutput', () => {
		it('without `user`', () => {
			expect(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				authorization.filterOutput();
			}).toThrow(InternalServerError);
		});

		it('without `user.features`', () => {
			const createdUser = {
				username: 'UserSemFeatures'
			};

			expect(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				authorization.filterOutput(createdUser);
			}).toThrow(InternalServerError);
		});

		it('without unknow `feature`', () => {
			const createdUser = {
				features: [FEATURES_USER.READ_USER]
			};

			expect(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				authorization.filterOutput(createdUser, { feature: FEATURES_USER.READ_USER });
			}).toThrow(InternalServerError);
		});

		it('with valid `user`, known `feature` but no `resource`', () => {
			const createdUser = {
				features: []
			};

			expect(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-expect-error
				authorization.filterOutput(createdUser, { feature: 'unknow_feature' });
			}).toThrow(InternalServerError);
		});

		it('with valid `user`, known `feature` and `resource`', () => {
			const createdUser = {
				features: [FEATURES_USER.READ_USER]
			};

			const resource = {
				id: 123,
				username: 'UserResource',
				features: [FEATURES_USER.READ_USER],
				created_at: '2024-01-01T00:00:00.000Z',
				updated_at: '2024-01-01T00:00:00.000Z',
				email: 'resource@email.com',
				password: '12345678'
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-expect-error
			const results = authorization.filterOutput(createdUser, {
				feature: FEATURES_USER.READ_USER,
				resource
			});

			expect(results).toStrictEqual({
				id: 123,
				username: 'UserResource',
				features: [FEATURES_USER.READ_USER],
				created_at: '2024-01-01T00:00:00.000Z',
				updated_at: '2024-01-01T00:00:00.000Z'
			});
		});
	});
});
