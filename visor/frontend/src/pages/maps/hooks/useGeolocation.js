import { useCallback, useEffect, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import { Fill, Stroke } from 'ol/style';
import { BRAND } from '@constants/brand';
import { trackGeolocate } from '@services/analyticsService';

const LOCATION_ZOOM = 14;
const LOCATION_RADIUS = 8;
const LOCATION_STROKE_WIDTH = 3;
const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
};

const buildLocationLayer = (coords) => {
    const feature = new Feature({ geometry: new Point(coords) });
    feature.setStyle(new Style({
        image: new Circle({
            radius: LOCATION_RADIUS,
            fill: new Fill({ color: BRAND.SECONDARY }),
            stroke: new Stroke({ color: '#ffffff', width: LOCATION_STROKE_WIDTH }),
        }),
    }));
    return new VectorLayer({
        source: new VectorSource({ features: [feature] }),
        zIndex: 1000,
    });
};

export const useGeolocation = ({ getActiveMap, isSwipe, mapRef, paneMapRefs, setIsLocating }) => {
    const locationLayersRef = useRef([]);

    const clearLocationLayers = useCallback((maps) => {
        locationLayersRef.current.forEach((layer) => {
            maps.forEach((m) => m.removeLayer(layer));
        });
        locationLayersRef.current = [];
    }, []);

    const locate = useCallback(() => {
        const primaryMap = getActiveMap();
        if (!primaryMap || !navigator.geolocation) return;

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = fromLonLat([position.coords.longitude, position.coords.latitude]);
                const targetMaps = isSwipe
                    ? [paneMapRefs?.current?.[0]?.current, paneMapRefs?.current?.[1]?.current].filter(Boolean)
                    : [primaryMap];

                clearLocationLayers(targetMaps);

                const layers = targetMaps.map(() => buildLocationLayer(coords));
                targetMaps.forEach((m, i) => m.addLayer(layers[i]));
                locationLayersRef.current = layers;

                primaryMap.getView().animate({
                    center: coords,
                    zoom: LOCATION_ZOOM,
                    duration: 500,
                });

                trackGeolocate('exito');
                setIsLocating(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                trackGeolocate('error');
                setIsLocating(false);
            },
            GEOLOCATION_OPTIONS,
        );
    }, [getActiveMap, isSwipe, paneMapRefs, setIsLocating, clearLocationLayers]);

    useEffect(() => {
        const mapInstance = mapRef?.current;
        const paneRefs = paneMapRefs;

        return () => {
            const candidateMaps = [
                mapInstance,
                paneRefs?.current?.[0]?.current,
                paneRefs?.current?.[1]?.current,
            ].filter(Boolean);
            locationLayersRef.current.forEach((layer) => {
                candidateMaps.forEach((m) => m.removeLayer(layer));
            });
            locationLayersRef.current = [];
        };
    }, [mapRef, paneMapRefs]);

    return { locate };
};
