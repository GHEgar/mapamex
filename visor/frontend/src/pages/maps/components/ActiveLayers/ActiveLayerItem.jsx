import { useMapsContext } from '@hooks/useMaps';
import { useLayerLoading } from '@hooks/useLayerLoading';
import { useEventoContext } from '@hooks/useEvento';
import { useSider } from '@contexts/SiderContext';
import Loading from '@components/Loading';
import { useEffect, useMemo, useRef, useState } from 'react';
import Tooltip from '@components/Tooltip';
import { findLayerDef } from '@pages/maps/helpers/wmsConfig';
import { LOOP_INTERVAL_PRESETS } from '@hooksMaps/useDateLoop';
import { handleKeyActivate } from '@utils/a11y';

import { DragHandle, LayerTitle, PinBadge, EventoLayerIcon } from './LayerItemHeader';
import LayerBadge from '@mapsComponents/LayerBadge';
import LayerDateControls from './LayerDateControls';
import Icon from '@components/Icon';
import SlotBadge from './SlotBadge';
import PeriodicityPill from './PeriodicityPill';
import { computeLabel } from './datePillHelpers';
import { ACTIVE_LAYERS_PANEL_WIDTH } from '@pages/maps/helpers/mapFit';

const ActiveLayerItem = ({ layer, dragHandleProps, isPinned = false }) => {
    const { loadingLayers } = useLayerLoading();
    const { isMobile, width: siderWidth } = useSider();
    const {
        selectedLayerForSymbology,
        setSelectedLayerForSymbology,
        onToggleLayer,
        clearLayerFilters,
        getAllChildLayerIds,
        toggleLayerVisibility,
        setPeriodicityRequest,
        getLoopState,
        toggleLoop,
        inferLoopConfig,
        getSpecificFilter,
        getLoopPrefs,
        setLoopIntervalMs,
        setLoopDirection,
        allLayers,
        compareMode,
        removeLayerFromSlot,
        toggleLayerVisibilityInSlot,
        setLayerSlotMembership,
        centerOnLayer,
        pulseLayer
    } = useMapsContext();

    const { findEventoByLayerId } = useEventoContext();
    const layerEvento = useMemo(
        () => findEventoByLayerId?.(layer.id) || null,
        [findEventoByLayerId, layer.id]
    );

    const slotMembership = useMemo(() => {
        if (!compareMode?.active) return null;
        const idsToCheck = [layer.id, ...(layer.childIds || [])];
        const paneAIds = compareMode.paneA?.activeLayerIds || [];
        const paneBIds = compareMode.paneB?.activeLayerIds || [];
        const inA = idsToCheck.some(id => paneAIds.includes(id));
        const inB = idsToCheck.some(id => paneBIds.includes(id));
        if (inA && inB) return 'AB';
        if (inA) return 'A';
        if (inB) return 'B';
        return null;
    }, [compareMode?.active, compareMode?.paneA?.activeLayerIds, compareMode?.paneB?.activeLayerIds, layer.id, layer.childIds]);

    const { intervalMs: loopIntervalMs, direction: loopDirection } = getLoopPrefs?.(layer.id) || {};

    const itemRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const isSelected = selectedLayerForSymbology?.id === layer.id;
    const isExpanded = isSelected;

    const showVisibility = !isPinned && (isMobile || isHovered || isSelected);
    const showDelete = !isPinned && (isMobile || isHovered || isSelected);
    const showHandle = !isPinned && (isSelected || (!isMobile && isHovered));

    useEffect(() => {
        if (isSelected && itemRef.current) {
            itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [isSelected]);

    const handleClickOnLayer = () => {
        const wasSelected = selectedLayerForSymbology?.id === layer.id;
        setSelectedLayerForSymbology(layer);
        if (!wasSelected) {
            centerOnLayer?.(layer.id, { siderWidth, isMobile, rightPanelWidth: ACTIVE_LAYERS_PANEL_WIDTH });
            pulseLayer?.(layer.id);
        }
    };

    const targetSlot = slotMembership === 'AB' ? compareMode?.activeSlot : slotMembership;

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        if (compareMode?.active) {
            if (slotMembership === 'A' || slotMembership === 'AB') removeLayerFromSlot?.(layer.id, 'A');
            if (slotMembership === 'B' || slotMembership === 'AB') removeLayerFromSlot?.(layer.id, 'B');
            return;
        }
        [layer.id, ...getAllChildLayerIds(layer.id)].forEach(id => clearLayerFilters(id));
        onToggleLayer(layer.id, false);
    };

    const handleToggleVisibilityClick = (e) => {
        e.stopPropagation();
        if (compareMode?.active && targetSlot) return toggleLayerVisibilityInSlot?.(layer.id, targetSlot);
        toggleLayerVisibility(layer.id);
    };

    const loopState = getLoopState?.(layer.id);
    const isLooping = loopState?.isPlaying;

    const layerDef = useMemo(() => findLayerDef(layer.id, allLayers), [layer.id, allLayers]);
    const rasterPeriodicity = layerDef?.rasterPeriodicity || null;
    const dateFilter = getSpecificFilter?.(layer.id, 'date') || null;

    const hasAnyDateLabel = useMemo(() => {
        const liveOk = computeLabel(dateFilter, rasterPeriodicity).label;
        const aOk = computeLabel(compareMode?.paneA?.filters?.[layer.id]?.date, rasterPeriodicity).label;
        const bOk = computeLabel(compareMode?.paneB?.filters?.[layer.id]?.date, rasterPeriodicity).label;
        return !!(liveOk || aOk || bOk);
    }, [dateFilter, rasterPeriodicity, compareMode?.paneA?.filters, compareMode?.paneB?.filters, layer.id]);

    const liveDateLabel = useMemo(() => computeLabel(dateFilter, rasterPeriodicity).label, [dateFilter, rasterPeriodicity]);

    const showSlotChip = !!compareMode?.active && !!slotMembership;
    const showTimeRow = !!compareMode?.active && (isExpanded || hasAnyDateLabel);
    const showHeaderPill = !compareMode?.active && !!liveDateLabel;
    const headerPillTooltip = `Fecha: ${liveDateLabel} — click para cambiar`;
    const handleCycleSlot = (next) => setLayerSlotMembership?.(layer.id, next);

    const canPlayLoop = useMemo(() => {
        if (isLooping) return true;
        return inferLoopConfig?.(layer.id) != null;
    }, [isLooping, inferLoopConfig, layer.id]);

    const handleDateLabelClick = (e) => {
        e.stopPropagation();
        setSelectedLayerForSymbology(layer);
        setPeriodicityRequest?.(layer.id);
    };

    const handlePlayClick = (e) => {
        e.stopPropagation();
        toggleLoop?.(layer.id);
    };

    const handleIntervalClick = (e) => {
        e.stopPropagation();
        const idx = LOOP_INTERVAL_PRESETS.indexOf(loopIntervalMs);
        const nextIdx = idx === -1 ? 0 : (idx + 1) % LOOP_INTERVAL_PRESETS.length;
        setLoopIntervalMs?.(layer.id, LOOP_INTERVAL_PRESETS[nextIdx]);
    };

    const handleDirectionClick = (e) => {
        e.stopPropagation();
        setLoopDirection?.(layer.id, loopDirection === 'rtl' ? 'ltr' : 'rtl');
    };

    const isLoading = useMemo(() => {
        if (loadingLayers.has(layer.id)) return true;
        if (layer.childIds) {
            return layer.childIds.some(id => loadingLayers.has(id));
        }
        return false;
    }, [loadingLayers, layer.id, layer.childIds]);

    return (
        <div
            ref={itemRef}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            className={`
                border border-transparent hover:border-slate-100
                transition-all hover:shadow-sm cursor-pointer overflow-hidden
                ${isSelected
            ? 'rounded-md bg-primary-soft/30 ring-1 ring-primary-deep'
            : `rounded-2xl ${layer.visible ? 'bg-slate-50' : 'bg-slate-100'}`}
            `}
            onClick={handleClickOnLayer}
            onKeyDown={handleKeyActivate(handleClickOnLayer)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col gap-1.5 px-2 py-2 w-full">
                <div className="flex items-center gap-2 min-h-8 w-full">
                    {isPinned && <PinBadge />}
                    {showHandle && <DragHandle dragHandleProps={dragHandleProps} />}
                    {showHeaderPill && (
                        <PeriodicityPill label={liveDateLabel} tooltip={headerPillTooltip} onClick={handleDateLabelClick} />
                    )}
                    {showSlotChip && (
                        <SlotBadge membership={slotMembership} onCycle={handleCycleSlot} layerId={layer.id} />
                    )}
                    <EventoLayerIcon evento={layerEvento} />
                    <LayerTitle name={layer.name} />
                    <LayerBadge badge={layer.badge} />
                    {isLoading && !isLooping && (
                        <Loading visible={true} size="size-5" border="border-2" />
                    )}
                    {showVisibility && (
                        <Tooltip content={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}>
                            <button
                                type="button"
                                onClick={handleToggleVisibilityClick}
                                className="p-1.5 rounded-full transition-colors cursor-pointer text-gray-500 hover:text-primary-deep hover:bg-primary-soft shrink-0"
                                aria-label={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
                            >
                                <Icon name={layer.visible ? 'visible' : 'hide'} className="size-5" />
                            </button>
                        </Tooltip>
                    )}
                    {showDelete && (
                        <Tooltip content="Eliminar capa">
                            <button
                                type="button"
                                onClick={handleRemoveClick}
                                className="p-1.5 rounded-full transition-colors cursor-pointer text-gray-500 hover:text-secondary hover:bg-secondary-soft shrink-0"
                                aria-label="Eliminar capa"
                            >
                                <Icon name="eliminar" className="size-5" />
                            </button>
                        </Tooltip>
                    )}
                </div>

                {showTimeRow && (
                    <LayerDateControls
                        layerId={layer.id}
                        layer={layer}
                        rasterPeriodicity={rasterPeriodicity}
                        compareMode={compareMode}
                        slotMembership={slotMembership}
                        liveDateFilter={dateFilter}
                        isLooping={isLooping}
                        isLoading={isLoading}
                        canPlayLoop={canPlayLoop}
                        loopIntervalMs={loopIntervalMs}
                        loopDirection={loopDirection}
                        onPillClick={handleDateLabelClick}
                        onPlay={handlePlayClick}
                        onInterval={handleIntervalClick}
                        onDirection={handleDirectionClick}
                    />
                )}
            </div>
        </div>
    );
};

export default ActiveLayerItem;
