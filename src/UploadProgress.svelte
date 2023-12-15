<script lang="ts">
  import prettyBytes from "pretty-bytes";
  import prettyMilliseconds from "pretty-ms";
  import makeEta from "simple-eta";
  import Spinner from "./Spinner.svelte";

  let data = $state<{
    eta: ReturnType<typeof makeEta>;
    sent: number;
    total: number;
    estimate?: number;
  }>();

  export function report(e: ProgressEvent) {
    data ??= {
      eta: makeEta({ min: 0, max: e.total }),
      sent: 0,
      total: e.total,
    };
    data.eta.report(e.loaded);
    data.sent = e.loaded;
    const estimate = data.eta.estimate();
    if (Number.isFinite(estimate)) {
      data.estimate = Math.round(estimate) * 1000;
    }
  }
</script>

{#if data}
  <h2>{((data.sent / data.total) * 100).toFixed(1)}%</h2>
  <p>{prettyBytes(data.sent)} / {prettyBytes(data.total)}</p>
  <p>{prettyBytes(data.eta.rate())}/s</p>
  <p>
    {#if data.estimate !== undefined}
      {prettyMilliseconds(data.estimate, { colonNotation: true })}
    {/if}
  </p>
{:else}
  <Spinner />
{/if}
