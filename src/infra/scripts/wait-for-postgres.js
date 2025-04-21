// eslint-disable-next-line @typescript-eslint/no-require-imports
const { exec } = require('node:child_process');

function checkPostgres() {
	exec('docker exec postgres-development pg_isready --host localhost', handleReturn);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	function handleReturn(error, stdout) {
		if (stdout.search('accepting connections') === -1) {
			process.stdout.write('.');
			checkPostgres();
			return;
		}

		console.log('\n🟢 Postgres está pronto e aceitando conexões!\n');
	}
}

process.stdout.write('\n\n🔴 Aguardando Postgres aceitar conexões');
checkPostgres();
