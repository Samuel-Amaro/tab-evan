export interface TypeEmailValues {
	id: number;
	sender: string;
	recipients: string[];
	subject: string;
	size: string;
	created_at: string;
}

export interface TypeEmailValuesBody {
	id: number;
	sender: string;
	recipients: string[];
	subject: string;
	size: string;
	created_at: string;
	text: string;
}
