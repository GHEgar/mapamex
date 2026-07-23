import api from '@shared/services/api';

const BASE = '/visor';


export const listBasemaps = async () => {
    const res = await api.get(`${BASE}/basemaps`);
    return res.data;
};

export const createBasemap = async (payload) => {
    const res = await api.post(`${BASE}/basemaps`, payload);
    return res.data;
};

export const updateBasemap = async (id, payload) => {
    const res = await api.put(`${BASE}/basemaps/${id}`, payload);
    return res.data;
};

export const deleteBasemap = async (id) => {
    await api.delete(`${BASE}/basemaps/${id}`);
};

export const reorderBasemaps = async (items) => {
    await api.post(`${BASE}/basemaps/reorder`, { items });
};
