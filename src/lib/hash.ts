import { browser } from "$app/environment";
import { on } from "svelte/events";
import { createSubscriber } from "svelte/reactivity";

export class Hash {
  #subscribe = createSubscriber((update) => {
    const off = on(window, "hashchange", update);
    return () => off();
  });
  get current() {
    if (!browser) return "";
    this.#subscribe();
    return window.location.hash;
  }
  set current(value) {
    if (!browser) return;
    window.location.hash = value;
  }
}
