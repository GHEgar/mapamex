import { JALISCO_BOUNDS } from './wmsConfig';

const DEFAULT_ESTADO_EXTENT = [-102.296, 21.16, -98.326, 24.492];

export const boundsFromExtent = (extent) => {
    if (!Array.isArray(extent) || extent.length !== 4 || extent.some(v => !Number.isFinite(v))) {
        return null;
    }
    const [minx, miny, maxx, maxy] = extent;
    const spanX = Math.max(maxx - minx, 0.001);
    const spanY = Math.max(maxy - miny, 0.001);
    const span = Math.max(spanX, spanY * 2);
    const zoom = Math.min(10, Math.max(5, Math.round(Math.log2(360 / span)) + 2));
    return {
        coords: [minx, miny, maxx, maxy],
        center: [(minx + maxx) / 2, (miny + maxy) / 2],
        zoom,
    };
};

let activeEstadoBounds = boundsFromExtent(DEFAULT_ESTADO_EXTENT) || JALISCO_BOUNDS;

export const setActiveEstadoBounds = (bounds) => {
    if (bounds && Array.isArray(bounds.coords) && bounds.coords.length === 4) {
        activeEstadoBounds = bounds;
    }
};

export const getActiveEstadoBounds = () => activeEstadoBounds;
