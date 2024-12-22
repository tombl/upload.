<script lang="ts">
  import prettyBytes from "pretty-bytes";
  import prettyMilliseconds from "pretty-ms";
  import FilePicker from "./FilePicker.svelte";
  import UploadProgress from "./UploadProgress.svelte";

  let { signedURL }: { signedURL: string } = $props();

  let data:
    | { phase: "pick" }
    | { phase: "zipping"; current: number; total: number }
    | { phase: "error" }
    | { phase: "uploading"; progress?: UploadProgress }
    | { phase: "done"; time: number; size: number } = $state({ phase: "pick" });

  async function onsubmit(files: FileList) {
    let file: Blob = files[0];
    if (files.length > 1) {
      data = { phase: "zipping", current: 0, total: files.length };
      const { createZip } = await import("../zip");
      file = await createZip([...files], (i) => {
        if (data.phase === "zipping") data.current = i + 1;
      });
    }

    const xhr = new XMLHttpRequest();
    data = { phase: "uploading" };

    xhr.upload.addEventListener("progress", (e) => {
      if (data.phase === "uploading") data.progress?.report(e);
    });

    xhr.addEventListener("error", () => (data.phase = "error"));

    xhr.addEventListener("load", () => {
      if (xhr!.status >= 400) {
        console.log(xhr!.response);
        data.phase = "error";
        return;
      }
      const end = Date.now();
      data = { phase: "done", time: end - start, size: file.size };
    });

    const start = Date.now();
    xhr.open("PUT", signedURL!);
    xhr.send(file);
  }
</script>

{#if data.phase == "zipping"}
  <h2>zipping</h2>
  <p>{data.current}/{data.total}</p>
{:else if data.phase === "error"}
  <h2>error.</h2>
  <p>you might not have permission to upload this file.</p>
  <p>otherwise, check your network.</p>
{:else if data.phase === "done"}
  <h2>done!</h2>
  <p>transferred {prettyBytes(data.size)} in {prettyMilliseconds(data.time)}</p>
{:else if data.phase === "uploading"}
  <UploadProgress bind:this={data.progress} />
{:else if data.phase === "pick"}
  <FilePicker {onsubmit} />
{:else}
  {data satisfies never}
{/if}
