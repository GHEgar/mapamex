import { get as getProjection } from 'ol/proj';

export const EXPORT_PROJECTION = 'EPSG:6368';

const PROJ_DEF = '+proj=utm +zone=13 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
const PROJ_EXTENT = [-1396865.12, 1337614.43, 2759543.0, 3809957.21];

let registered = false;

export const ensureExportProjection = async () => {
    if (!registered) {
        const [{ default: proj4 }, { register }] = await Promise.all([
            import('proj4'),
            import('ol/proj/proj4'),
        ]);
        proj4.defs(EXPORT_PROJECTION, PROJ_DEF);
        register(proj4);
        getProjection(EXPORT_PROJECTION).setExtent(PROJ_EXTENT);
        registered = true;
    }
    return getProjection(EXPORT_PROJECTION);
};
