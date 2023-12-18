<script lang="ts">
  import prettyBytes from "pretty-bytes";
  import prettyMilliseconds from "pretty-ms";
  import makeEta from "simple-eta";
  import { onMount } from "svelte";
  import Spinner from "./Spinner.svelte";

  let sent = $state(0);
  let total = $state<number>();
  let rate = $state(0);

  let remaining: number;
  let debouncedRemaining = $state<number>();

  onMount(() => {
    const interval = setInterval(() => {
      if (remaining === undefined) return;
      if (
        debouncedRemaining === undefined ||
        Math.abs(debouncedRemaining - remaining) / remaining > 0.1
      ) {
        debouncedRemaining = remaining;
        return;
      }
      if (debouncedRemaining > 1) debouncedRemaining--;
    }, 1000);
    return () => clearInterval(interval);
  });

  let eta: ReturnType<typeof makeEta>;
  export function report(e: ProgressEvent) {
    eta ??= makeEta({ min: 0, max: e.total });
    eta.report(e.loaded);

    sent = e.loaded;
    total = e.total;

    rate = eta.rate();

    const estimate = eta.estimate();
    if (Number.isFinite(estimate)) remaining = estimate;
  }
</script>

{#if total === undefined}
  <Spinner />
{:else}
  <h2>{((sent / total) * 100).toFixed(1)}%</h2>
  <p>{prettyBytes(sent)} / {prettyBytes(total)}</p>
  <p>{prettyBytes(rate)}/s</p>
  <p>
    {#if debouncedRemaining !== undefined}
      {prettyMilliseconds(Math.round(debouncedRemaining) * 1000, {
        colonNotation: true,
      })}
    {:else}
      <span style:opacity={0.5}>0:00</span>
    {/if}
  </p>
{/if}
