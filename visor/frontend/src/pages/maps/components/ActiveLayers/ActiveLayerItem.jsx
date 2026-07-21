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
import LayerItemMenu from './LayerItemMenu';
import Icon from '@components/Icon';
import SlotBadge from './SlotBadge';
import PeriodicityPill from './PeriodicityPill';
import { computeLabel, computePeriodicityHint } from './datePillHelpers';
import { ACTIVE_LAYERS_PANEL_WIDTH } from '@pages/maps/helpers/mapFit';
import { useWMSLegend } from '@hooksMaps/useWMSLegend';
import { useLayerMetadata } from '@hooksMaps/useLayerMetadata';
import { useLayerDownload } from '@hooksMaps/useLayerDownload';
import DownloadMenu from '@mapsComponents/LayerDetailModal/components/DownloadMenu';

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
        setSelectedLayer,
        getLoopState,
        toggleLoop,
        inferLoopConfig,
        getFilter,
        getSpecificFilter,
        getLoopPrefs,
        setLoopIntervalMs,
        setLoopDirection,
        allLayers,
        compareMode,
        removeLayerFromSlot,
        toggleLayerVisibilityInSlot,
        setLayerSlotMembership,
        getLayerOpacity,
        setLayerOpacity,
        setActiveSlot,
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
    const [menuOpen, setMenuOpen] = useState(false);
    const isSelected = selectedLayerForSymbology?.id === layer.id;
    const isExpanded = isSelected;

    const { metadata, loading: metadataLoading } = useLayerMetadata((isExpanded || menuOpen) ? layer.id : null);
    const download = useLayerDownload(layer.id, { getFilter, getSpecificFilter, metadata });
    const canDownload = (isExpanded || menuOpen) && metadata?.capa_descargable !== false;

    const showMenu = !isPinned && (isMobile || isHovered || menuOpen || download.menuOpen);
    const showDelete = !isPinned && (isMobile || isHovered || isSelected || menuOpen || download.menuOpen);
    const showHandle = !isPinned && (isSelected || (!isMobile && isHovered));
    const handleDownloadClick = () => {
        if (download.downloading) download.handleCancelDownload();
        else download.setMenuOpen(p => !p);
    };

    useEffect(() => {
        if (isSelected && itemRef.current) {
            itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [isSelected]);

    const canOpenModal = layer.id !== 'curvas_de_nivel';

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

    const handleSetSelectedLayerClick = (e) => {
        e.stopPropagation();
        setSelectedLayer(layer);
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

    const periodicityHint = useMemo(() => computePeriodicityHint(rasterPeriodicity), [rasterPeriodicity]);
    const liveDateLabel = useMemo(() => computeLabel(dateFilter, rasterPeriodicity).label, [dateFilter, rasterPeriodicity]);

    const showSlotChip = !!compareMode?.active && !!slotMembership;
    const showTimeRow = compareMode?.active ? (isExpanded || hasAnyDateLabel) : (isExpanded || isLooping);
    const headerPillLabel = liveDateLabel || periodicityHint;
    const showHeaderPill = !compareMode?.active && !showTimeRow && !!headerPillLabel;
    const headerPillTooltip = liveDateLabel ? `Fecha: ${liveDateLabel} — click para cambiar` : 'Capa con periodicidad — elige una fecha';
    const handleCycleSlot = (next) => setLayerSlotMembership?.(layer.id, next);

    const effectiveOpacity = useMemo(() => {
        const own = getLayerOpacity?.(layer.id) ?? 1;
        if (own !== 1) return own;
        if (layer.childIds?.length) {
            for (const id of layer.childIds) {
                const op = getLayerOpacity?.(id);
                if (op != null && op !== 1) return op;
            }
        }
        return own;
    }, [getLayerOpacity, layer.id, layer.childIds]);

    const canPlayLoop = useMemo(() => {
        if (isLooping) return true;
        return inferLoopConfig?.(layer.id) != null;
    }, [isLooping, inferLoopConfig, layer.id]);

    const handleDateLabelClick = (e) => {
        e.stopPropagation();
        setSelectedLayer(layer);
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

    const { hasLegend } = useWMSLegend();
    const layerHasLegend = hasLegend(layer);

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
                        <PeriodicityPill label={headerPillLabel} tooltip={headerPillTooltip} onClick={handleDateLabelClick} />
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
                    {showMenu && (
                        <LayerItemMenu
                            layerId={layer.id}
                            open={menuOpen && !download.menuOpen}
                            onToggle={() => setMenuOpen(o => !o)}
                            onClose={() => setMenuOpen(false)}
                            kebabRef={download.menuAnchorRef}
                            visible={layer.visible}
                            isLoading={isLoading}
                            isLooping={isLooping}
                            canOpenModal={canOpenModal}
                            opacity={effectiveOpacity}
                            hasLegend={layerHasLegend}
                            slotMembership={slotMembership}
                            activeSlot={compareMode?.activeSlot}
                            canDownload={canDownload}
                            metadataLoading={metadataLoading}
                            isDownloading={download.downloading}
                            onToggleVisibility={handleToggleVisibilityClick}
                            onOpenDetails={handleSetSelectedLayerClick}
                            onChangeOpacity={(v) => setLayerOpacity?.(layer.id, v)}
                            onDownloadClick={handleDownloadClick}
                            onSwitchSlot={setActiveSlot}
                        />
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

                {canDownload && download.menuOpen && (
                    <DownloadMenu
                        open={download.menuOpen}
                        anchorRef={download.menuAnchorRef}
                        onClose={() => download.setMenuOpen(false)}
                        isRaster={download.isRaster}
                        hasDateFilter={download.hasDateFilter}
                        availableMetadata={download.availableMetadata}
                        onDownload={download.handleMenuDownload}
                    />
                )}
            </div>
        </div>
    );
};

export default ActiveLayerItem;
