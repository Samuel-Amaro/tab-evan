<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import type { Status } from '../../types/status';

	const queryDatas = createQuery<Status>({
		queryKey: ['status'],
		refetchInterval: 2000,
		queryFn: async () => {
			const response = await fetch('/api/v1/status');
			const data = (await response.json()) as Status;
			return data;
		}
	});
</script>

{#if $queryDatas.status === 'pending'}
	<h4>Carregando...</h4>
{:else if $queryDatas.status === 'error'}
	<h4>Error: {$queryDatas.error.name}</h4>
	<p>{$queryDatas.error.message}</p>
{:else}
	<div>
		<p>
			Última atualização: {new Date($queryDatas.data.updated_at).toLocaleString('pt-BR')}
		</p>
		<h2>Banco de dados</h2>
		<p>Versão do banco de dados: {$queryDatas.data.dependencies.database.version}</p>
		<p>Conexões ativas: {$queryDatas.data.dependencies.database.opened_connections}</p>
		<p>Máximo de conexões: {$queryDatas.data.dependencies.database.max_connections}</p>
	</div>
{/if}
