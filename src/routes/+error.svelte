<script lang="ts">
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>{page.status}.</title>
</svelte:head>
<h1>{page.status}.</h1>

<main>
  {page.error?.message ?? "Error"}
</main>
