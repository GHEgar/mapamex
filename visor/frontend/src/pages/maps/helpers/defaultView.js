import { fromLonLat } from 'ol/proj';

const isMobileViewport = () => window.innerWidth < 768;

export const getDefaultMapView = () => {
    const mobile = isMobileViewport();
    return {
        center: fromLonLat(mobile ? [-100.4, 22.6] : [-100.5, 22.8]),
        zoom: mobile ? 6.3 : 7.3
    };
};

export const getMinZoom = () => 5;
