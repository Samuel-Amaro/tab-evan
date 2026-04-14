// See https://svelte.dev/docs/kit/types#app.d.ts

import type { TypeUser } from './types/user';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: TypeUser;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
