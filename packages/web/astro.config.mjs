import { defineConfig, passthroughImageService } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://web.digitalcrewchief.at/",

  integrations: [
      react(),
      sitemap(),
	],

  output: "server",

  adapter: cloudflare({
      mode: "directory",
	}),

  prefetch: true,
  images: passthroughImageService(),

  vite: {
    plugins: [tailwindcss()],
  },
});