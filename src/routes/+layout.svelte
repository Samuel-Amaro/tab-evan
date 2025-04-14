<script lang="ts">
	import { QueryClientProvider, type QueryClient } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		queryClient: QueryClient;
	}

	let { children, queryClient }: Props = $props();
</script>

<QueryClientProvider client={queryClient}>
	{@render children()}
	<SvelteQueryDevtools />
</QueryClientProvider>
