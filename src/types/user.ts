export type TypeUserValues = {
	username: string;
	email: string;
	password: string;
	features?: string[];
};

export type TypeUser = {
	id: string;
	username: string;
	email: string;
	password: string;
	features: string[];
	created_at: string;
	updated_at: string;
};

export enum FEATURES_USER {
	//uma feature e composta pela ação:objeto:modificador
	//EX: read: ação de ler, activation_token: objeto alvo
	CREATE_SESSION = 'create:session',
	READ_ACTIVATION_TOKEN = 'read:activation_token',
	CREATE_USER = 'create:user'
}
