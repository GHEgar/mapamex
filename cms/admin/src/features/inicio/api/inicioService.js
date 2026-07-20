import api from '@shared/services/api';

export const getMisBorradores = async () => {
    const res = await api.get('/borradores/mios');
    return res.data;
};

export const getBorradoresPendientes = async () => {
    const res = await api.get('/borradores/pendientes');
    return res.data;
};

export const getTileCacheStatus = async () => {
    const res = await api.get('/geoserver/tile-cache-status');
    return res.data;
};
