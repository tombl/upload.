import adapter from "@sveltejs/adapter-static";

export default /** @satisfies {import('@sveltejs/kit').Config} */ ({
  kit: {
    adapter: adapter({ fallback: "404.html" }),
    output: { bundleStrategy: "single" },
  },
});
