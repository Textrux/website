import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Add the PWA plugin here:
    VitePWA({
      registerType: "autoUpdate",
      // "autoUpdate" will automatically check for and install new service-worker
      // versions in the background. You could also do "prompt" if you want a
      // custom "Update now?" prompt.

      devOptions: {
        enabled: true,
        // `enabled: true` means the plugin will also run in dev mode,
        // so you can test offline usage while running `npm run dev`.
      },

      // Optionally define a minimal manifest:
      manifest: {
        name: "Textrux PWA",
        short_name: "Textrux",
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        // icons, etc.
      },
    }),
  ],
});
