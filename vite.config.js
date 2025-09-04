import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // equivale a 0.0.0.0; acepta cliente1.local
    port: 5173, // o el que uses
    // 👇 Solo si ves problemas de HMR con el dominio:
    // hmr: {
    //   host: "cliente1.local",
    //   protocol: "ws",
    //   port: 5173,
    // },
  },
});
