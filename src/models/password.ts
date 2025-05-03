import bcrypt from 'bcryptjs';

async function hash(password: string) {
	const rounds = getNumberOfRounds();

	return await bcrypt.hash(password, rounds);
}

function getNumberOfRounds() {
	return import.meta.env.MODE === 'production' ? 14 : 1;
}

async function compare(providedPassword: string, storedPassword: string) {
	return await bcrypt.compare(providedPassword, storedPassword);
}

const password = {
	hash,
	compare
};

export default password;
