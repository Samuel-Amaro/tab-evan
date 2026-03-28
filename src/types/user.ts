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
	//ação: oque o usuário esta tentando fazer
	//objeto: objeto alvo(recurso) da ação
	//modificador: que pode apimentar a relação entre a ação e o objeto, como por exemplo, um usuário só pode atualizar outro usuário se for um admin, ou um usuário pode atualizar apenas ele mesmo.
	CREATE_SESSION = 'create:session',
	READ_ACTIVATION_TOKEN = 'read:activation_token',
	CREATE_USER = 'create:user',
	READ_SESSION = 'read:session',
	UPDATE_USER = 'update:user',
	UPDATE_USER_OTHERS = 'update:user:others',
	READ_USER = 'read:user',
	READ_USER_SELF = 'read:user:self',
	READ_MIGRATION = 'read:migration',
	CREATE_MIGRATION = 'create:migration',
	READ_STATUS = 'read:status',
	READ_STATUS_ALL = 'read:status:all'
}
