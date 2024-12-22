<script lang="ts">
  let hovering = $state(false);
  let input: HTMLInputElement | undefined = $state();

  let { onsubmit }: { onsubmit: (files: FileList) => void } = $props();
</script>

<input
  bind:this={input}
  type="file"
  multiple
  onchange={(e) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) onsubmit(files);
  }}
/>

<svelte:body
  onclick={() => input?.click()}
  ondragenter={() => {
    hovering = true;
  }}
  ondragexit={() => {
    hovering = false;
  }}
  onmouseleave={() => {
    hovering = false;
  }}
  onblur={() => {
    hovering = false;
  }}
  ondrop={(e) => {
    e.preventDefault();
    hovering = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) onsubmit(files);
  }}
/>

{#if hovering}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
{:else}
  <p>drop a file here<br />or <button>browse</button></p>
{/if}

<style>
  input[type="file"] {
    display: none;
  }
</style>
