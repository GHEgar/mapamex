/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createRoot } from 'react-dom/client'
import './index.css'
import NotFound from '@pages/NotFound';
import ErrorPage from '@pages/ErrorPage';
import MainProvider from '@providers/MainProvider';
import MapsProvider from '@providers/MapsProvider';
import { LayersProvider } from '@providers/LayersProvider';
import { LayerLoadingProvider } from '@contexts/LayerLoadingContext';
import Loading from '@components/Loading';
import { startVisorCacheVersionWatcher } from '@services/eventosService';
import.meta.env;

const isEmbedRoute = typeof window !== 'undefined' && window.location.pathname.endsWith('/embed');
if (!isEmbedRoute) {
    startVisorCacheVersionWatcher();
}

const Maps = lazy(() => import('@pages/maps/Maps'));
const EmbedRoot = lazy(() => import('@pages/embed/EmbedRoot'));

const isDev = import.meta.env.VITE_NODE_ENV === 'development';

isDev && console.info('¡Tú estás viendo esto, porque estás en modo de desarrollo!');

const mapElement = (
    <LayersProvider><LayerLoadingProvider><MapsProvider><Maps /></MapsProvider></LayerLoadingProvider></LayersProvider>
);

const router = createBrowserRouter([
    {
        element: <MainProvider />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: mapElement },
            { path: 'mapa', element: mapElement },
            { path: 'embed', element: <EmbedRoot /> },
            { path: '*', element: <NotFound /> },
        ],
    },
], { basename: import.meta.env.VITE_BASE_PATH || '/' });

createRoot(document.getElementById('root')).render(
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loading visible /></div>}>
        <RouterProvider router={router} />
    </Suspense>
)
