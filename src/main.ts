/// <reference types="vite/client" />

import { mount } from "svelte";
import App from "./App.svelte";
import { qpack, qunpack } from "./qpack";

declare global {
  var PREFIX: string;
}

// we use the hash like part of the URL, so treat it as such
addEventListener("hashchange", () => location.reload());

const url = new URL(location.hash.slice(1), window.PREFIX);
try {
  url.search = qunpack(url.search.slice(1)).toString();
} catch (err) {
  console.warn(err);
  const packed = qpack(url.searchParams);
  console.log("compressed from", url.search.length, "to", packed.length);
  if (packed.length < url.search.length) {
    const u = new URL(url);
    url.search = packed;
    let hash = u.toString();
    if (hash.startsWith(window.PREFIX)) hash = hash.slice(window.PREFIX.length);
    location.hash = hash;
  }
}

mount(App, {
  target: document.querySelector("main")!,
  props: { url: url.search === "" ? undefined : url.toString() },
});
