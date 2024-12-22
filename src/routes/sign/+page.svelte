<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { AwsV4Signer } from "aws4fetch";

  async function sign({
    accessKeyId,
    secretAccessKey,
    region,
    endpoint,
    object,
  }: Record<string, string>) {
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

    localStorage.setItem("upload.accessKey", accessKeyId);
    localStorage.setItem("upload.region", region);
    localStorage.setItem("upload.endpoint", endpoint);
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
      const formData = new FormData(e.currentTarget);
      sign(Object.fromEntries(formData) as Record<string, string>);
    }}
  >
    <label>
      <span>access key</span>
      <input
        type="text"
        name="accessKeyId"
        defaultValue={globalThis.localStorage?.getItem("upload.accessKey")}
        required
      />
    </label>
    <label>
      <span>secret key</span>
      <input name="secretAccessKey" type="password" required />
    </label>
    <label>
      <span>region</span>
      <input
        type="text"
        name="region"
        defaultValue={globalThis.localStorage?.getItem("upload.region")}
        required
      />
    </label>
    <label>
      <span>endpoint</span>
      <input
        type="text"
        name="endpoint"
        defaultValue={globalThis.localStorage?.getItem("upload.endpoint") ??
          globalThis.PREFIX ??
          ""}
        required
      />
    </label>
    <label>
      <span>object</span>
      <input name="object" type="text" required />
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
