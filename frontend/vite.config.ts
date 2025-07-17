// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       stream: 'stream-browserify',
//       buffer: 'buffer',
//       events: 'events',
//       process: 'process/browser',
//     },
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       define: { global: 'globalThis' },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           buffer: true,
//           process: true,
//         }),
//         NodeModulesPolyfillPlugin(),
//       ],
//     },
//   },
//   build: {
//     minify: 'terser', 
//     terserOptions: {
//       keep_classnames: true,
//       keep_fnames: true, 
//     },
//     rollupOptions: {
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           buffer: true,
//           process: true,
//         }),
//       ],
//     },
//     commonjsOptions: {
//       transformMixedEsModules: true,
//     },
//   },
// });
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true // optional but good
    })
  ],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer',
      events: 'events',
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  }
})
