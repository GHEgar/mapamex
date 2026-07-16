import { defineConfig } from 'vite';
import { resolve } from 'path';


export default defineConfig({
    build: {
        target: 'es2020',
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: false,
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'VisorWidget',
            formats: ['iife', 'es'],
            fileName: (format) => format === 'iife' ? 'visor.v1.js' : 'visor.v1.es.js',
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
        sourcemap: true,
        minify: 'esbuild',
    },
});
