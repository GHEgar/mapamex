const API_HOST = (import.meta.env.VITE_BACKEND_API_HOST || '/api/').replace(/\/+$/, '');

const listCache = new Map();

export const fetchEstadosList = async ({ signal, force = false } = {}) => {
    if (!force && listCache.has('all')) {
        return listCache.get('all');
    }
    const res = await fetch(`${API_HOST}/estados/`, { signal });
    if (!res.ok) {
        throw new Error(`Backend responde ${res.status} al listar estados`);
    }
    const data = await res.json();
    const items = (data?.items || []).map(item => ({
        cveEnt: String(item.cveEnt),
        nombre: String(item.nombre),
        extent: Array.isArray(item.extent) && item.extent.length === 4
            ? item.extent.map(Number)
            : null,
    }));
    listCache.set('all', items);
    return items;
};

export const clearEstadoCache = () => {
    listCache.clear();
};
