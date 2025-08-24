<script lang="ts">
  import Spinner from "$lib/components/Spinner.svelte";
  import App from "$lib/components/Uploader.svelte";
  import { Hash } from "$lib/hash";
  import { qpack, qunpack } from "$lib/qpack";

  let mounted = $state(false);
  $effect.pre(() => {
    mounted = true;
  });

  const hash = new Hash();

  function getURL() {
    if (!hash.current) return;
    const url = new URL(hash.current.slice(1), window.PREFIX);
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
        hash.current = url.toString();
        if (hash.current.startsWith(window.PREFIX)) {
          hash.current = hash.current.slice(window.PREFIX.length);
        }
      }
    }
  });
</script>

<svelte:head>
  <title>upload.</title>
</svelte:head>
<h1>upload.</h1>

<main>
  <noscript><p>this page<br />requires javascript</p></noscript>

  {#if !mounted}
    <Spinner />
  {:else if signed === undefined}
    you need permission<br />to upload a file
  {:else}
    <App signedURL={signed.url.toString()} />
  {/if}
</main>
