import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';

const CARTO_ATTRIBUTIONS = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const cartoSource = (path) => new XYZ({
    url: `https://basemaps.cartocdn.com/${path}/{z}/{x}/{y}{r}.png`,
    attributions: CARTO_ATTRIBUTIONS,
    subdomains: ['a', 'b', 'c', 'd'],
    crossOrigin: 'anonymous',
});

export const BASEMAPS = {
    voyager: {
        id: 'carto_voyager',
        label: 'Mapa Carto Voyager',
        type: 'xyz',
        labelZoomThreshold: 15,
        create: () => cartoSource('rastertiles/voyager_nolabels'),
        createLabelsOverlay: () => cartoSource('rastertiles/voyager_only_labels'),
    },
    position: {
        id: 'carto_light',
        label: 'Carto Light',
        type: 'xyz',
        labelZoomThreshold: 15,
        create: () => cartoSource('light_nolabels'),
        createLabelsOverlay: () => cartoSource('light_only_labels'),
    },
    sin_visor: {
        id: 'sin_visor',
        label: 'Sin Mapa Base',
        type: 'none',
        create: () => null,
    }
};

export const BASEMAP_ORDER = [
    'voyager',
    'position',
    'sin_visor'
];

const buildXYZSource = (url, attributions, subdomains, maxZoom) => {
    const options = {
        attributions: attributions || undefined,
        crossOrigin: 'anonymous',
    };
    if (maxZoom != null) options.maxZoom = maxZoom;

    const subs = Array.isArray(subdomains) ? subdomains.filter(Boolean) : [];
    if (subs.length && url.includes('{s}')) {
        options.urls = subs.map(s => url.replaceAll('{s}', s));
    } else {
        options.url = url;
    }
    return new XYZ(options);
};

const buildWMSSource = (url, params) => new TileWMS({
    url,
    params: { TILED: true, FORMAT: 'image/png', TRANSPARENT: true, VERSION: '1.1.0', ...(params || {}) },
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
});

const buildBasemapEntry = (cfg) => {
    if (cfg.type === 'none') {
        return { id: cfg.slug, label: cfg.label, type: 'none', create: () => null };
    }
    if (cfg.type === 'wms') {
        return {
            id: cfg.slug,
            label: cfg.label,
            type: 'wms',
            create: () => (cfg.url ? buildWMSSource(cfg.url, cfg.wmsParams) : null),
        };
    }
    const entry = {
        id: cfg.slug,
        label: cfg.label,
        type: 'xyz',
        create: () => (cfg.url ? buildXYZSource(cfg.url, cfg.attributions, cfg.subdomains, cfg.maxZoom) : null),
    };
    if (cfg.labelsUrl) {
        entry.createLabelsOverlay = () => buildXYZSource(cfg.labelsUrl, cfg.attributions, cfg.subdomains, cfg.maxZoom);
        if (cfg.labelZoomThreshold != null) entry.labelZoomThreshold = cfg.labelZoomThreshold;
    }
    return entry;
};

export const buildBasemapsFromConfig = (list) => {
    const basemaps = {};
    const order = [];
    (list || []).forEach((cfg) => {
        if (!cfg?.slug) return;
        basemaps[cfg.slug] = buildBasemapEntry(cfg);
        order.push(cfg.slug);
    });
    if (order.length === 0) return { basemaps: BASEMAPS, order: BASEMAP_ORDER };
    return { basemaps, order };
};

const GEOSERVER_BASE = (import.meta.env.VITE_GEOSERVER_URL || '').replace(/\/+$/, '');

const RELIEF_WORKSPACE = 'raster';

const RELIEF_LAYER = 'hillshade_cog';

export const RELIEF_OVERLAY_Z_INDEX = 10000;

export const createReliefSource = () => new TileWMS({
    url: `${GEOSERVER_BASE}/${RELIEF_WORKSPACE}/wms`,
    params: {
        LAYERS: `${RELIEF_WORKSPACE}:${RELIEF_LAYER}`,
        TILED: true,
        FORMAT: 'image/png',
        TRANSPARENT: true,
        VERSION: '1.1.0',
    },
    serverType: 'geoserver',
    hidpi: false,
    crossOrigin: 'anonymous',
});
