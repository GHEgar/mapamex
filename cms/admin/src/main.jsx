import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createRoot } from 'react-dom/client'
import { Result, Spin } from 'antd';
import './index.css'
import { AuthProvider } from '@shared/contexts/AuthContext';
import MainProvider from '@app/providers/MainProvider';
import ProtectedRoute from '@app/guards/ProtectedRoute';
import RoleProtectedRoute from '@app/guards/RoleProtectedRoute';
import ErrorBoundary from '@app/guards/ErrorBoundary';
import MainLayout from '@app/MainLayout';
import { Navigate } from 'react-router';
import Login from '@features/auth/pages/LoginPage';
import ChangePassword from '@features/auth/pages/ChangePasswordPage';
import { buildVisorApiKeysRoutes } from '@features/visor-api-keys/routes';

const isDev = import.meta.env.DEV;

const Users = lazy(() => import('@features/users'));
const Actividad = lazy(() => import('@features/actividad'));
const Storage = lazy(() => import('@features/storage'));
const RevisionQueue = lazy(() => import('@features/revision'));
const LayerEditPage = lazy(() => import('@features/visor-layers').then((m) => ({ default: m.LayerEditPage })));
const InitialLayerOrderPage = lazy(() => import('@features/visor-layers').then((m) => ({ default: m.InitialLayerOrderPage })));
const BulkIngestPage = lazy(() => import('@features/visor-layers').then((m) => ({ default: m.BulkIngestPage })));
const EventosListPage = lazy(() => import('@features/visor-eventos').then((m) => ({ default: m.EventosListPage })));
const EventoEditPage = lazy(() => import('@features/visor-eventos').then((m) => ({ default: m.EventoEditPage })));
const HomePage = lazy(() => import('@features/visor-home').then((m) => ({ default: m.HomePage })));
const SymbolsPage = lazy(() => import('@features/visor-symbols').then((m) => ({ default: m.SymbolsPage })));
const GeoserverFilesPage = lazy(() => import('@features/visor-geoserver-files').then((m) => ({ default: m.GeoserverFilesPage })));
const VisorStatsPage = lazy(() => import('@features/visor-stats').then((m) => ({ default: m.VisorStatsPage })));
const DocumentacionPage = lazy(() => import('@features/documentacion').then((m) => ({ default: m.DocumentacionPage })));
const Inicio = lazy(() => import('@features/inicio'));
const Perfil = lazy(() => import('@features/perfil'));

const PageFallback = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
    </div>
);

const withSuspense = (node) => <Suspense fallback={<PageFallback />}>{node}</Suspense>;

const router = createBrowserRouter([
    {
        element: <MainProvider />,
        errorElement: <ErrorBoundary />,
        children: [
            { path: '/login', element: <Login />, errorElement: <ErrorBoundary /> },
            {
                element: (<ProtectedRoute><MainLayout /></ProtectedRoute>),
                errorElement: <ErrorBoundary />,
                children: [
                    { index: true, element: <Navigate to="inicio" replace /> },
                    {
                        path: 'inicio',
                        element: withSuspense(<Inicio />)
                    },
                    {
                        path: 'perfil',
                        element: withSuspense(<Perfil />)
                    },
                    {
                        path: 'users',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani']}>
                                <Users />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'actividad',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani']}>
                                <Actividad />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'revision',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani']}>
                                <RevisionQueue />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'storage',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <Storage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/layers',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <LayerEditPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/layers/:id/edit',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <LayerEditPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/initial-order',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani']}>
                                <InitialLayerOrderPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/layers/ingesta-masiva',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <BulkIngestPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/eventos',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <EventosListPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/eventos/nuevo',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <EventoEditPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/eventos/:id/edit',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <EventoEditPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/home',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <HomePage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/simbolos',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani']}>
                                <SymbolsPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/recursos-geoserver',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <GeoserverFilesPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/stats',
                        element: withSuspense(
                            <RoleProtectedRoute allowedRoles={['tetlamamakani', 'editora']}>
                                <VisorStatsPage />
                            </RoleProtectedRoute>
                        )
                    },
                    {
                        path: 'visor/stats/sesiones',
                        element: <Navigate to="/visor/stats?tab=sesiones" replace />
                    },
                    ...buildVisorApiKeysRoutes(withSuspense),
                    {
                        path: 'documentacion',
                        element: withSuspense(<DocumentacionPage />)
                    },
                    {
                        path: 'change-password',
                        element: (
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        )
                    }, {
                        path: '*',
                        element: (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                                <Result
                                    status="404"
                                    title="404"
                                    subTitle="Lo sentimos, la página que visitaste no existe."
                                />
                            </div>
                        )
                    },
                ]
            }
        ],
    },
], { basename: '/cms' });

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
);
