import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname, '');
    const {
        VITE_ADMIN_PORT,
        VITE_ADMIN_HOST,
        VITE_VISOR_PROXY_URL,
    } = env;

    const visorTarget = VITE_VISOR_PROXY_URL || 'http://visor-dev-frontend-1:3006';
    const statsEnabled = env.BUILD_STATS === '1' || env.BUILD_STATS === 'true';

    const plugins = [react()];

    if (statsEnabled) {
        plugins.push(visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
            template: 'treemap',
        }));
    }

    return {
        plugins,
        root: '.',
        server: {
            host: VITE_ADMIN_HOST ?? '0.0.0.0',
            port: Number(VITE_ADMIN_PORT ?? '3011'),
            strictPort: true,
            watch: {
                usePolling: true,
            },
            proxy: {
                '/storage/thumb': {
                    target: env.VITE_STORAGE_THUMB_PROXY_URL || 'http://api:8000',
                    changeOrigin: true,
                },
                '/visor': {
                    target: visorTarget,
                    changeOrigin: false,
                    headers: { host: 'localhost' },
                    rewrite: (p) => p.replace(/^\/visor/, ''),
                },
            },
        },
        base: '/cms/',
        build: {
            outDir: 'dist',
            sourcemap: false,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router'],
                        'antd': ['antd', '@ant-design/icons'],
                        'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
                    },
                },
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@app': path.resolve(__dirname, './src/app'),
                '@features': path.resolve(__dirname, './src/features'),
                '@shared': path.resolve(__dirname, './src/shared'),
                '@assets': path.resolve(__dirname, './src/assets'),
            },
        },
    };
});
