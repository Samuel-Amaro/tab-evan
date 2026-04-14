function getOrigin() {
	if (['test', 'development'].includes(process.env.NODE_ENV ?? '')) {
		return 'http://localhost:5173';
	}

	if (process.env.VERCEL_ENV === 'preview') {
		return `https://${process.env.VERCEL_URL}`;
	}

	return 'https://tab-evan.vercel.app';
}

const webserver = {
	getOrigin
};

export default webserver;
