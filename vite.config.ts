import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createRuntimeIdentity } from './scripts/runtime/runtime-identity.mjs'

function runtimeDiscoveryPlugin(): Plugin {
  const identity = createRuntimeIdentity(
    process.cwd(),
    process.env.APP_ENV || 'development',
    process.env.RUNTIME_INSTANCE_ID || undefined
  )
  const startedAt = new Date().toISOString()
  return {
    name: 'social-base-runtime-discovery',
    configureServer(server) {
      server.middlewares.use('/__runtime', (_request, response) => {
        const address = server.httpServer?.address()
        const port = typeof address === 'object' && address ? address.port : Number(process.env.FRONTEND_PORT || 5199)
        response.setHeader('content-type', 'application/json; charset=utf-8')
        response.end(JSON.stringify({ ...identity, pid: process.pid, port, startedAt }))
      })
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [vue(), runtimeDiscoveryPlugin()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.FRONTEND_PORT || 5199),
    strictPort: Boolean(process.env.FRONTEND_PORT),
    proxy: { '/api': `http://127.0.0.1:${process.env.API_PORT || 4174}` },
  },
});
