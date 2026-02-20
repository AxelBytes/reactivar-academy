import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Minificar y ofuscar código en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remover console.log en producción
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      },
      mangle: {
        // Ofuscar nombres de variables
        safari10: true,
      },
      format: {
        comments: false, // Remover comentarios
      },
    },
    // Separar código en chunks para mejor performance
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-toast'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Source maps solo en desarrollo
    sourcemap: mode !== 'production',
  },
}));
