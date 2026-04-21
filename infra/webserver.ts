function getOrigin() {
	if (['test', 'development'].includes(process.env.NODE_ENV ?? '')) {
		return 'http://localhost:5173';
	}

	if (process.env.VERCEL_ENV === 'preview') {
		return `https://${process.env.VERCEL_URL}`;
	}

	//https://tab-evan.vercel.app, dominio vercel
	return 'https://tabevangelho.com.br';
}

const webserver = {
	getOrigin
};

export default webserver;
