import { useEffect, useState } from 'react';
import { fetchBasemaps } from '@services/basemapsService';
import { BASEMAPS, BASEMAP_ORDER, buildBasemapsFromConfig } from '@pages/maps/helpers/basemaps';

export const useBasemaps = () => {
    const [basemaps, setBasemaps] = useState(BASEMAPS);
    const [basemapOrder, setBasemapOrder] = useState(BASEMAP_ORDER);

    useEffect(() => {
        let cancelled = false;
        fetchBasemaps()
            .then((list) => {
                if (cancelled || !list?.length) return;
                const built = buildBasemapsFromConfig(list);
                setBasemaps(built.basemaps);
                setBasemapOrder(built.order);
            })
            .catch((err) => {
                if (import.meta.env.DEV) console.warn('[basemaps] usando fallback:', err);
            });
        return () => { cancelled = true; };
    }, []);

    return { basemaps, basemapOrder };
};
