const API_BASE = import.meta.env.VITE_VISOR_PUBLIC_API_HOST || '/api/visor/';

const buildUrl = (path) => {
    const base = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
    return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
};

export const fetchBasemaps = async () => {
    const res = await fetch(buildUrl('basemaps'), { credentials: 'omit' });
    if (!res.ok) throw new Error(`GET /basemaps fallo ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
};
