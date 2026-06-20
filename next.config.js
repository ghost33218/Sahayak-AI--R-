const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // The Gemma 2B model shards are fetched from the WebLLM CDN the first time
  // the app runs online. Caching them here is what makes "offline after one
  // visit" actually true — without this, the browser would re-download the
  // ~1.5GB model on every load.
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/huggingface\.co\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "webllm-model-cache",
        expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 365 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/raw\.githubusercontent\.com\/mlc-ai\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "webllm-config-cache",
        expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // WebLLM relies on WebGPU + WASM threads, which need these headers set
  // (SharedArrayBuffer is gated behind cross-origin isolation).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
