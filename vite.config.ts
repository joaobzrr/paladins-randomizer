import path from "node:path";
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import solidSvg from 'vite-plugin-solid-svg'
import devtools from 'solid-devtools/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/paladins-randomizer/",
  plugins: [
    devtools({ autoname: true }),
    solid(),
    solidSvg()
  ],
  build: {
    minify: mode === "production"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
