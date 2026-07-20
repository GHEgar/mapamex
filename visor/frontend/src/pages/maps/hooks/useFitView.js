import { useCallback } from 'react';
import { transformExtent } from 'ol/proj';
import { fetchLayerExtent } from '@services/layerExtentService';
import { getFitPadding, ACTIVE_LAYERS_PANEL_WIDTH } from '@pages/maps/helpers/mapFit';
import { JALISCO_BOUNDS } from '@pages/maps/helpers/wmsConfig';

const FIT_DURATION = 500;
const FIT_MAX_ZOOM = 18;

const resolveExtentFromConfig = async (layer) => {
    const config = layer?.defaultZoom;
    if (!config) return null;

    if (config === 'fit' || config?.fit === true) {
        return await fetchLayerExtent(layer);
    }
    if (config.extent) {
        return transformExtent(config.extent, 'EPSG:4326', 'EPSG:3857');
    }
    return null;
};

export const useFitView = ({ getActiveMap, activeLayerIds, findLayerById, siderWidth, isMobile }) => {
    const resolveTargetExtent = useCallback(async () => {
        const ids = Array.isArray(activeLayerIds) ? [...activeLayerIds].reverse() : [];
        for (const id of ids) {
            const layer = findLayerById?.(id);
            const extent = await resolveExtentFromConfig(layer);
            if (extent) return extent;
        }
        return transformExtent(JALISCO_BOUNDS.coords, 'EPSG:4326', 'EPSG:3857');
    }, [activeLayerIds, findLayerById]);

    const fitView = useCallback(async () => {
        const map = getActiveMap();
        if (!map) return;

        const extent = await resolveTargetExtent();
        if (!extent) return;

        const padding = getFitPadding({
            mapSize: map.getSize(),
            siderWidth,
            isMobile,
            rightPanelWidth: ACTIVE_LAYERS_PANEL_WIDTH,
        });
        map.getView().fit(extent, { duration: FIT_DURATION, maxZoom: FIT_MAX_ZOOM, padding });
    }, [getActiveMap, resolveTargetExtent, siderWidth, isMobile]);

    return { fitView };
};
