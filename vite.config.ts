import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType:"autoUpdate",
      manifest:{
        name: 'To-Do',
        short_name: 'To-Do',
        start_url: './',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#007bff',
      
        icons:[
          {
          src: '/icons/icon192X192.png',
          sizes: '192x192',
          type: 'image/png'
          }
        ],

        screenshots:[
          {
          src: '/icons/icon512x512.png',
          sizes: '192x192',
          type: 'image/png'
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  
  ],
});
