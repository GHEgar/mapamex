import { lazy } from 'react';
import RoleProtectedRoute from '@app/guards/RoleProtectedRoute';


export const buildVisorApiKeysRoutes = (withSuspense) => {
    const VisorApiKeysPage = lazy(() => import('@features/visor-api-keys').then((m) => ({ default: m.VisorApiKeysPage })));
    return [
        { path: 'visor/api-keys', element: withSuspense(<RoleProtectedRoute allowedRoles={['tetlamamakani']}><VisorApiKeysPage /></RoleProtectedRoute>) },
    ];
};
