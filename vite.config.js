import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath } from 'node:url'

function src(path) {
  return fileURLToPath(new URL(`./src/${path}`, import.meta.url))
}

export default defineConfig(({ mode }) => {
  const demo = mode === 'demo'

  return {
    plugins: [react(), basicSsl()],
    resolve: {
      alias: {
        '@db': src(demo ? 'db.demo.js' : 'db.js'),
        '@gate': src(demo ? 'DemoGate.jsx' : 'AuthGate.jsx'),
      },
    },
  }
})