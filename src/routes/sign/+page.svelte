<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { AwsV4Signer } from "aws4fetch";

  let accessKeyId = $state(
    globalThis.localStorage?.getItem("upload.accessKey") ?? ""
  );
  $effect(() => {
    globalThis.localStorage?.setItem("upload.accessKey", accessKeyId);
  });

  let secretAccessKey = $state("");

  let region = $state(globalThis.localStorage?.getItem("upload.region") ?? "");
  $effect(() => {
    globalThis.localStorage?.setItem("upload.region", region);
  });

  let endpoint = $state(
    globalThis.localStorage?.getItem("upload.endpoint") || (globalThis.PREFIX ?? "")
  );
  $effect(() => {
    globalThis.localStorage?.setItem("upload.endpoint", endpoint);
  });

  let object = $state("");

  async function sign() {
    if (!endpoint.startsWith("http")) endpoint = "https://" + endpoint;
    if (!endpoint.endsWith("/")) endpoint += "/";

    const signer = new AwsV4Signer({
      accessKeyId,
      secretAccessKey,
      region,
      method: "PUT",
      url: endpoint + object,
      service: "s3",
      signQuery: true,
    });
    await goto(`${base}/#${(await signer.sign()).url.toString()}`);
  }
</script>

<svelte:head>
  <title>sign.</title>
</svelte:head>
<h1>sign.</h1>

<main>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      sign();
    }}
  >
    <label>
      <span>access key</span>
      <input bind:value={accessKeyId} type="text" />
    </label>
    <label>
      <span>secret key</span>
      <input bind:value={secretAccessKey} type="password" />
    </label>
    <label>
      <span>region</span>
      <input bind:value={region} type="text" />
    </label>
    <label>
      <span>endpoint</span>
      <input bind:value={endpoint} type="text" />
    </label>
    <label>
      <span>object</span>
      <input bind:value={object} type="text" />
    </label>
    <button>sign</button>
  </form>
</main>

<style>
  form {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }
  label {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.25rem;
  }
  span {
    font-size: 0.9rem;
  }
  input {
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background-color: #fff2;
    color: inherit;
    padding: 0.5rem;
  }
</style>
