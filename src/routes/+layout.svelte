<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<QueryClientProvider client={data.queryClient}>
	{@render children()}
	<SvelteQueryDevtools />
</QueryClientProvider>
