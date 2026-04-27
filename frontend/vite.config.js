import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify("http://localhost:5000"),
    "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify("test-api-key"),
    "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify("test-project.firebaseapp.com"),
    "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify("test-project"),
    "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify("test-project.appspot.com"),
    "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify("123456789"),
    "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify("1:123456789:web:abcdef123456"),
    "import.meta.env.VITE_GOOGLE_API_KEY": JSON.stringify("test-google-api-key"),
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
