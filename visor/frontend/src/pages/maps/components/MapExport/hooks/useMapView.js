import { useMapsContext } from '@hooks/useMaps';
import { transformExtent } from 'ol/proj';

export const useMapView = () => {
    const { mapRef, paneMapRefs, compareMode } = useMapsContext();

    const getActiveMapRef = () => {
        if (compareMode?.active && paneMapRefs?.current?.[0]?.current) {
            return paneMapRefs.current[0];
        }
        return mapRef;
    };

    const getViewportExtent = () => {
        const ref = getActiveMapRef();
        if (!ref?.current) return null;
        const view = ref.current.getView();
        const extent = view.calculateExtent(ref.current.getSize());
        return transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    };

    return {
        getViewportExtent,
        getActiveMapRef
    };
};
