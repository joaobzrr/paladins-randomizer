import path from "path";
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import devtools from 'solid-devtools/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    devtools({
      autoname: true
    }),
    solid()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
