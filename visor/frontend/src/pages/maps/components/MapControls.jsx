import { useCallback, useEffect, useState } from 'react';
import { useMapsContext } from '@hooks/useMaps';
import { useSider } from '@contexts/SiderContext';
import { useGeolocation } from '@pages/maps/hooks/useGeolocation';
import { useFitView } from '@pages/maps/hooks/useFitView';
import Icon from '@components/Icon';
import { trackMapZoomLevel } from '@services/analyticsService';

const ZOOM_DURATION = 250;

const ControlButton = ({ name, title, ariaLabel, onClick, disabled = false, active = false }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={disabled}
            className="p-2 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed active:scale-95"
            title={title}
            aria-label={ariaLabel}
        >
            <Icon
                name={name}
                state={!disabled && (hovered || active) ? 'hover' : 'normal'}
                className="w-6 h-6"
            />
        </button>
    );
};

const FitViewButton = ({ getActiveMap }) => {
    const { activeLayerIds, findLayerById } = useMapsContext();
    const { width: siderWidth, isMobile } = useSider();
    const { fitView } = useFitView({ getActiveMap, activeLayerIds, findLayerById, siderWidth, isMobile });

    return (
        <ControlButton
            name="fit_extent"
            title="Vista completa"
            ariaLabel="Encuadrar la vista completa"
            onClick={fitView}
        />
    );
};

const MapControls = ({ variant = 'full' }) => {
    const {
        mapRef,
        compareMode,
        paneMapRefs,
        isLocating,
        setIsLocating,
    } = useMapsContext();
    const [zoomBounds, setZoomBounds] = useState({ atMin: false, atMax: false });
    const isSwipe = !!compareMode?.active;
    const isCompact = variant === 'compact';

    const getActiveMap = useCallback(() => {
        if (isSwipe) return paneMapRefs?.current?.[0]?.current ?? null;
        return mapRef?.current ?? null;
    }, [isSwipe, mapRef, paneMapRefs]);

    const { locate } = useGeolocation({ getActiveMap, isSwipe, mapRef, paneMapRefs, setIsLocating });

    const syncZoomBounds = useCallback(() => {
        const map = getActiveMap();
        if (!map) return;
        const view = map.getView();
        const zoom = view.getZoom();
        if (typeof zoom !== 'number') return;
        setZoomBounds({
            atMin: zoom <= view.getMinZoom(),
            atMax: zoom >= view.getMaxZoom(),
        });
    }, [getActiveMap]);

    useEffect(() => {
        const map = getActiveMap();
        if (!map) return undefined;
        const view = map.getView();
        syncZoomBounds();
        view.on('change:resolution', syncZoomBounds);
        return () => view.un('change:resolution', syncZoomBounds);
    }, [getActiveMap, syncZoomBounds]);

    const handleZoom = useCallback((delta) => {
        const map = getActiveMap();
        if (!map) return;
        const view = map.getView();
        const current = view.getZoom();
        const target = current + delta;
        if (target > view.getMaxZoom() || target < view.getMinZoom()) return;
        view.animate({ zoom: target, duration: ZOOM_DURATION });
        trackMapZoomLevel(target);
    }, [getActiveMap]);

    return (
        <div className="flex flex-col-reverse md:flex-row rounded-2xl bg-white shadow-lg overflow-hidden">
            {!isCompact && (
                <>
                    <ControlButton
                        name="center"
                        title="Mi ubicación"
                        ariaLabel="Ir a mi ubicación"
                        onClick={locate}
                        disabled={isLocating}
                        active={isLocating}
                    />
                    <FitViewButton getActiveMap={getActiveMap} />
                </>
            )}
            <ControlButton
                name="zoomout"
                title="Alejar"
                ariaLabel="Alejar zoom"
                onClick={() => handleZoom(-1)}
                disabled={zoomBounds.atMin}
            />
            <ControlButton
                name="zoomin"
                title="Acercar"
                ariaLabel="Acercar zoom"
                onClick={() => handleZoom(1)}
                disabled={zoomBounds.atMax}
            />
        </div>
    );
};

export default MapControls;
