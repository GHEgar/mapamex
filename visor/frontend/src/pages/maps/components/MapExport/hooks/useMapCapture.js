import { useMapsContext } from '@hooks/useMaps';
import { EXPORT_DIMENSIONS } from '../utils/exportDimensions';
const { MAP_WIDTH, MAP_HEIGHT } = EXPORT_DIMENSIONS;
import { transform, transformExtent, getPointResolution } from 'ol/proj';
import View from 'ol/View';
import { getActiveEstadoBounds } from '../../../helpers/estadoBounds';
import { ensureExportProjection, EXPORT_PROJECTION } from '../utils/exportProjection';
import { useMapView } from './useMapView';
import { composeSwipeCanvas } from '../utils/swipeComposition';

const getAllLayers = (layerCollection) => {
    const result = [];
    layerCollection.forEach(layer => {
        if (typeof layer.getLayers === 'function') {
            result.push(...getAllLayers(layer.getLayers()));
        } else {
            result.push(layer);
        }
    });
    return result;
};

const transformMapGeometries = (maps, sourceProjection, destinationProjection) => {
    maps.forEach(map => {
        getAllLayers(map.getLayers()).forEach(layer => {
            let source = typeof layer.getSource === 'function' ? layer.getSource() : null;
            if (source && typeof source.getSource === 'function' && source.getSource()) {
                source = source.getSource();
            }
            if (!source || typeof source.getFeatures !== 'function') return;
            source.getFeatures().forEach(feature => {
                feature.getGeometry()?.transform(sourceProjection, destinationProjection);
            });
        });
        map.getOverlays().forEach(overlay => {
            const position = overlay.getPosition();
            if (position) {
                overlay.setPosition(transform(position, sourceProjection, destinationProjection));
            }
        });
    });
};

export const useMapCapture = () => {
    const { targetRef, mapRef, compareMode, paneMapRefs } = useMapsContext();
    const { getActiveMapRef } = useMapView();

    const isSwipe = !!compareMode?.active;
    const getSwipeComposite = () => document.querySelector('[data-swipe-composite="true"]');
    const getPaneTarget = (i) => paneMapRefs?.current?.[i]?.current?.getTargetElement?.() || null;

    const prepareScaleControl = (scaleControl) => {
        if (!scaleControl) return null;
        const originalStyles = {
            left: scaleControl.style.left,
            bottom: scaleControl.style.bottom,
            right: scaleControl.style.right,
            top: scaleControl.style.top,
            transform: scaleControl.style.transform
        };
        scaleControl.style.left = 'auto';
        scaleControl.style.bottom = '15px';
        scaleControl.style.right = '330px';
        scaleControl.style.top = 'auto';
        scaleControl.style.transform = 'scale(1.5)';
        scaleControl.style.transformOrigin = 'bottom right';
        return originalStyles;
    };

    const restoreScaleControl = (scaleControl, originalStyles) => {
        if (!scaleControl || !originalStyles) return;
        scaleControl.style.left = originalStyles.left;
        scaleControl.style.bottom = originalStyles.bottom;
        scaleControl.style.right = originalStyles.right;
        scaleControl.style.top = originalStyles.top;
        scaleControl.style.transform = originalStyles.transform;
    };

    const waitForTilesToLoad = () => {
        const refs = isSwipe
            ? [paneMapRefs?.current?.[0]?.current, paneMapRefs?.current?.[1]?.current].filter(Boolean)
            : [mapRef.current].filter(Boolean);
        if (refs.length === 0) return Promise.resolve();
        return Promise.all(refs.map(m => new Promise(resolve => m.once('rendercomplete', resolve))));
    };

    const captureElement = async (element, options = {}) => {
        if (!element) return null;
        const html2canvas = (await import('html2canvas-pro')).default;
        return html2canvas(element, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scale: 1,
            logging: false,
            ...options
        });
    };

    const captureMap = async (scale = 1, mapWidth = MAP_WIDTH, mapHeight = MAP_HEIGHT) => {
        const target = isSwipe ? getSwipeComposite() : targetRef.current;
        if (!target) return null;
        return captureElement(target, { scale, width: mapWidth, height: mapHeight });
    };

    const captureSwipeComposite = async ({ mapWidth, mapHeight, captureScale, swipeOptions }) => {
        const targetA = getPaneTarget(0);
        const targetB = getPaneTarget(1);
        if (!targetA || !targetB) return null;

        const [canvasA, canvasB] = await Promise.all([
            captureElement(targetA, { scale: captureScale, width: mapWidth, height: mapHeight }),
            captureElement(targetB, { scale: captureScale, width: mapWidth, height: mapHeight }),
        ]);

        const finalWidth = Math.round(mapWidth * captureScale);
        const finalHeight = Math.round(mapHeight * captureScale);
        return composeSwipeCanvas({
            canvasA,
            canvasB,
            width: finalWidth,
            height: finalHeight,
            swipePosition: (compareMode?.swipePosition ?? 0.5) * 100,
            orientation: compareMode?.swipeOrientation || 'vertical',
            swipeOptions: swipeOptions || {},
            labelA: compareMode?.paneA?.label || 'A',
            labelB: compareMode?.paneB?.label || 'B',
        });
    };

    const waitForImages = async (container) => {
        const images = container.querySelectorAll('img');
        await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));
    };

    const getMapSnapshot = async ({ extent, viewType = 'viewport', mapWidth = MAP_WIDTH, mapHeight = MAP_HEIGHT, captureScale = 1, swipeOptions = null }) => {
        const target = isSwipe ? getSwipeComposite() : targetRef.current;
        const anchorRef = getActiveMapRef();
        if (!target || !anchorRef?.current) return null;

        const additionalRefs = isSwipe && paneMapRefs?.current?.[1]?.current ? [paneMapRefs.current[1].current] : [];
        const allManagedRefs = [anchorRef.current, ...additionalRefs];

        const projection = await ensureExportProjection();

        let originalState = null;
        let layerResolutions = [];
        let geometriesProjected = false;
        const targetsToResize = isSwipe
            ? [target, getPaneTarget(0), getPaneTarget(1)].filter(Boolean)
            : [target];
        try {
            originalState = {
                targetSizes: targetsToResize.map(el => ({ el, width: el.style.width, height: el.style.height })),
                views: allManagedRefs.map(m => m.getView())
            };

            const allLayersFlat = allManagedRefs.flatMap(m => getAllLayers(m.getLayers()));
            layerResolutions = allLayersFlat.map(layer => ({ layer, minResolution: layer.getMinResolution() }));
            allLayersFlat.forEach(layer => layer.setMinResolution(0));

            targetsToResize.forEach(el => {
                el.style.width = `${mapWidth}px`;
                el.style.height = `${mapHeight}px`;
            });
            allManagedRefs.forEach(m => m.updateSize());

            transformMapGeometries(allManagedRefs, 'EPSG:3857', EXPORT_PROJECTION);
            geometriesProjected = true;

            const baseView = originalState.views[0];
            const exportView = new View({
                projection,
                center: transform(baseView.getCenter(), 'EPSG:3857', EXPORT_PROJECTION),
                resolution: getPointResolution('EPSG:3857', baseView.getResolution(), baseView.getCenter())
            });
            allManagedRefs.forEach(m => m.setView(exportView));

            if (viewType === 'full-state') {
                const stateExtent = transformExtent(getActiveEstadoBounds().coords, 'EPSG:4326', EXPORT_PROJECTION);
                exportView.fit(stateExtent, { padding: [50, 50, 50, 50], duration: 0 });
            } else if (extent) {
                const projectedExtent = transformExtent(extent, 'EPSG:4326', EXPORT_PROJECTION);
                const extentW = projectedExtent[2] - projectedExtent[0];
                const extentH = projectedExtent[3] - projectedExtent[1];
                exportView.setCenter([
                    (projectedExtent[0] + projectedExtent[2]) / 2,
                    (projectedExtent[1] + projectedExtent[3]) / 2
                ]);
                exportView.setResolution(Math.min(extentW / mapWidth, extentH / mapHeight));
            }

            await waitForTilesToLoad();

            const utmExtent = exportView.calculateExtent(anchorRef.current.getSize());
            const capturedExtent = transformExtent(utmExtent, EXPORT_PROJECTION, 'EPSG:4326');

            const canvas = isSwipe
                ? await captureSwipeComposite({ mapWidth, mapHeight, captureScale, swipeOptions })
                : await captureMap(captureScale, mapWidth, mapHeight);

            return canvas ? { canvas, extent: capturedExtent, utmExtent } : null;
        } catch (error) {
            console.error('Error in getMapSnapshot:', error);
            throw error;
        } finally {
            layerResolutions.forEach(({ layer, minResolution }) => layer.setMinResolution(minResolution));

            if (originalState) {
                allManagedRefs.forEach((m, i) => m.setView(originalState.views[i]));
                if (geometriesProjected) {
                    transformMapGeometries(allManagedRefs, EXPORT_PROJECTION, 'EPSG:3857');
                }
                originalState.targetSizes.forEach(({ el, width, height }) => {
                    el.style.width = width;
                    el.style.height = height;
                });
                allManagedRefs.forEach(m => m.updateSize());
            }
        }
    };

    return {
        prepareScaleControl,
        restoreScaleControl,
        waitForTilesToLoad,
        captureMap,
        captureElement,
        waitForImages,
        getMapSnapshot
    };
};
