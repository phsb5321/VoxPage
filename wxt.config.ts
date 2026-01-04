import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'VoxPage',
    description: 'Text-to-speech for web pages with word-level highlighting',
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'offscreen',  // Chrome Offscreen Documents API for audio
    ],
    host_permissions: [
      'https://api.openai.com/*',
      'https://api.elevenlabs.io/*',
      'https://api.cartesia.ai/*',
      'https://api.groq.com/*',
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self';",
    },
  },

  browser: process.env.BROWSER || 'firefox',

  // Development server
  dev: {
    server: {
      port: 3000,
    },
  },

  // Vite configuration
  vite: () => ({
    build: {
      target: 'es2020',
      sourcemap: true,
    },
  }),
});
