<script lang="ts">
  import Spinner from "$lib/components/Spinner.svelte";
  import App from "$lib/components/Uploader.svelte";
  import { qpack, qunpack } from "$lib/qpack";

  let mounted = $state(false);
  $effect.pre(() => {
    mounted = true;
  });

  let hash = $state(globalThis.location?.hash ?? "");

  $effect(() => {
    // effects only run on the client
    if (location.hash !== hash) location.hash = hash!;
  });

  function getURL() {
    if (!hash) return;
    const url = new URL(hash.slice(1), window.PREFIX);
    try {
      url.search = qunpack(url.search.slice(1)).toString();
      return { url, compressed: true };
    } catch (err) {
      console.warn("unpacking:", err);
      return { url, compressed: false };
    }
  }

  let signed = $derived(getURL());

  $effect(() => {
    if (!signed) return;
    if (!signed.compressed) {
      const packed = qpack(signed.url.searchParams);
      console.log(
        "compressed from",
        signed.url.search.length,
        "to",
        packed.length
      );
      if (packed.length < signed.url.search.length) {
        const url = new URL(signed.url);
        url.search = packed;
        hash = url.toString();
        if (hash.startsWith(window.PREFIX)) {
          hash = hash.slice(window.PREFIX.length);
        }
      }
    }
  });
</script>

<svelte:window
  on:hashchange={() => {
    hash = location.hash;
  }}
/>

<!-- blocked on https://github.com/sveltejs/svelte/pull/9953
<noscript><p>this page<br />requires javascript</p></noscript> -->

{#if !mounted}
  <Spinner />
{:else if signed === undefined}
  you need permission to upload a file
{:else}
  <App signedURL={signed.url.toString()} />
{/if}
