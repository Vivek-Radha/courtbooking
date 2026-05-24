import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        // search up for workspace root
        '..',
        // allow the brain directory for uploaded attachments
        'C:/Users/vivek/.gemini/antigravity-ide/brain/0d678851-e4ec-4b1e-ac1f-e494304fdea5'
      ]
    }
  }
})
