import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Get git commit hash at build time
const getCommitHash = () => {
  try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
    
    // Check if the repo is dirty (has uncommitted changes)
    const isDirty = execSync('git diff --quiet HEAD || echo "dirty"').toString().trim() === 'dirty'
    
    return isDirty ? `${commitHash}-dirty` : commitHash
  } catch (error) {
    console.warn('Could not get git commit hash:', error)
    return 'unknown'
  }
}

// Get the latest git tag for version
const getVersion = () => {
  try {
    const latestTag = execSync('git describe --tags --abbrev=0').toString().trim()
    return latestTag
  } catch (error) {
    console.warn('Could not get git tag, using development version:', error)
    return 'development'
  }
}

// Plugin to process service worker and inject build variables
const processServiceWorkerPlugin = () => {
  return {
    name: 'process-service-worker',
    generateBundle(this: any) {
      const swPath = path.resolve('public/sw.js')
      if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf-8')
        swContent = swContent.replace('__COMMIT_HASH__', getCommitHash())
        
        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: swContent
        })
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), processServiceWorkerPlugin()],
  base: process.env.VITE_BASE_URL || '/',
  define: {
    __COMMIT_HASH__: JSON.stringify(getCommitHash()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().split('T')[0]),
    __VERSION__: JSON.stringify(getVersion()),
    __DEMO_MODE__: JSON.stringify(process.env.VITE_DEMO_MODE === 'true'),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: process.env.VITE_DEMO_MODE === 'true' ? false : 'esbuild', // Disable minification for demo/GitHub Pages
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@headlessui/react'],
        }
      }
    }
  }
})
