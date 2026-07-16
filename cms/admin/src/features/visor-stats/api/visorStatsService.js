import api from '@shared/services/api';

const periodParams = (period = {}) => ({
    date_from: period.dateFrom,
    date_to: period.dateTo,
    grain: period.grain,
});

export const getOverview = async (period) => {
    const res = await api.get('/visor-stats/overview', { params: periodParams(period) });
    return res.data;
};

export const getTopLayers = async (limit = 20, period) => {
    const res = await api.get('/visor-stats/layers', { params: { limit, ...periodParams(period) } });
    return res.data;
};

export const getButtons = async (period) => {
    const res = await api.get('/visor-stats/buttons', { params: periodParams(period) });
    return res.data;
};

export const getEventos = async (limit = 50, period) => {
    const res = await api.get('/visor-stats/eventos', { params: { limit, ...periodParams(period) } });
    return res.data;
};

export const getThemes = async (limit = 50, period) => {
    const res = await api.get('/visor-stats/themes', { params: { limit, ...periodParams(period) } });
    return res.data;
};

export const getTools = async (period) => {
    const res = await api.get('/visor-stats/tools', { params: periodParams(period) });
    return res.data;
};

export const getDaily = async (period) => {
    const res = await api.get('/visor-stats/daily', { params: periodParams(period) });
    return res.data;
};

export const getSessions = async ({ page = 1, pageSize = 25, source = 'all', period } = {}) => {
    const res = await api.get('/visor-stats/sessions', {
        params: { page, page_size: pageSize, source, ...periodParams(period) },
    });
    return res.data;
};

export const refreshStats = async () => {
    const res = await api.post('/visor-stats/refresh');
    return res.data;
};

export const getHighlights = async () => {
    const res = await api.get('/visor-stats/highlights');
    return res.data;
};

export const getMcpOverview = async (period) => {
    const res = await api.get('/visor-stats/mcp/overview', { params: periodParams(period) });
    return res.data;
};

export const getMcpTools = async (limit = 30, period) => {
    const res = await api.get('/visor-stats/mcp/tools', { params: { limit, ...periodParams(period) } });
    return res.data;
};

export const getMcpDaily = async (period) => {
    const res = await api.get('/visor-stats/mcp/daily', { params: periodParams(period) });
    return res.data;
};

export const getMcpClients = async (period) => {
    const res = await api.get('/visor-stats/mcp/clients', { params: periodParams(period) });
    return res.data;
};
