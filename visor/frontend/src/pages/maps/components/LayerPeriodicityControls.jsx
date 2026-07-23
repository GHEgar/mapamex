import { useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import MapsContext from '@contexts/MapsContext';
import { useLayerPeriodicity } from '@hooksMaps/useLayerPeriodicity';
import { findLayerDef, findWMSConfig } from '@pages/maps/helpers/wmsConfig';
import { fetchGeometryType } from '@utils/featureInfoUtils';
import { buildLoopValues } from '@pages/maps/helpers/dateLoopHelpers';
import { trackPeriodicityAdvanced } from '@services/analyticsService';
import PeriodicitySection from './LayerDetailModal/components/PeriodicitySection';

const LayerPeriodicityControls = ({ layerId }) => {
    const {
        allLayers, compareMode,
        applyFilter, clearFilter, getSpecificFilter,
        getLoopState, startLoop, toggleLoop, stopLoop, inferLoopConfig,
        getLoopPrefs, setLoopIntervalMs, setLoopDirection,
        applyFilterToSlot, clearFilterFromSlot, setActiveSlot,
        periodicityRequest, setPeriodicityRequest,
    } = useContext(MapsContext);

    const [expandedYear, setExpandedYear] = useState(null);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [singleSelectOnly, setSingleSelectOnly] = useState(false);
    const flashRef = useRef(null);

    const { periodicity, loading: periodicityLoading } = useLayerPeriodicity(layerId);
    const layerDef = useMemo(() => (layerId ? findLayerDef(layerId, allLayers) : null), [layerId, allLayers]);
    const rasterPeriodicity = layerDef?.rasterPeriodicity || null;
    const hidePeriodicity = layerDef?.hidePeriodicity || false;

    useEffect(() => {
        if (!layerId || rasterPeriodicity) return undefined;
        const wmsConfig = findWMSConfig(layerId, allLayers);
        if (!wmsConfig) return undefined;
        let cancelled = false;
        fetchGeometryType(wmsConfig.baseUrl, wmsConfig.layerName).then(type => {
            if (!cancelled) setSingleSelectOnly(type === 'polygon');
        });
        return () => { cancelled = true; };
    }, [layerId, rasterPeriodicity, allLayers]);

    const hasPeriodicity = !hidePeriodicity && (periodicity != null || periodicityLoading || rasterPeriodicity != null);

    useEffect(() => {
        setExpandedYear(null);
    }, [layerId]);

    useEffect(() => {
        if (isAdvancedMode && layerId) trackPeriodicityAdvanced(layerId);
    }, [isAdvancedMode, layerId]);

    useEffect(() => {
        if (periodicityRequest && periodicityRequest === layerId) {
            const el = flashRef.current;
            if (el) {
                el.classList.remove('periodicity-flash');
                void el.offsetWidth;
                el.classList.add('periodicity-flash');
            }
            setPeriodicityRequest(null);
        }
    }, [periodicityRequest, layerId, setPeriodicityRequest]);

    const isSwipe = !!compareMode?.active;
    const inA = isSwipe && compareMode.paneA?.activeLayerIds?.includes(layerId);
    const inB = isSwipe && compareMode.paneB?.activeLayerIds?.includes(layerId);
    const slotMembership = isSwipe ? (inA && inB ? 'AB' : (inA ? 'A' : (inB ? 'B' : null))) : null;

    const onAdvancedToggle = useCallback(() => setIsAdvancedMode(prev => !prev), []);

    const handleDateFilterApply = (filterData) => {
        if (layerId) applyFilter(layerId, filterData.filterName, filterData.cqlFilter);
    };
    const handleClearFilter = () => {
        if (layerId) clearFilter(layerId, 'date');
    };

    const makeSlotApply = (slot) => (fd) => layerId && applyFilterToSlot?.(layerId, slot, fd.filterName, fd.cqlFilter);
    const makeSlotClear = (slot) => () => layerId && clearFilterFromSlot?.(layerId, slot, 'date');
    const makeSlotGetFilter = (slot) => (lid, fname) => compareMode?.[`pane${slot}`]?.filters?.[lid]?.[fname] || null;

    const loopState = layerId ? getLoopState?.(layerId) : null;
    const isLoopPlaying = loopState?.isPlaying ?? false;
    const dateFilter = layerId ? getSpecificFilter?.(layerId, 'date') : null;
    const hasDateFilter = !!dateFilter;
    const layerPrefs = layerId ? getLoopPrefs?.(layerId) : null;
    const layerIntervalMs = layerPrefs?.intervalMs;
    const layerDirection = layerPrefs?.direction;

    const viewLoopConfig = () => {
        if (!layerId) return null;
        if (expandedYear != null) {
            const values = buildLoopValues({ mode: 'month', year: expandedYear, rasterPeriodicity, periodicity });
            return values.length >= 2 ? { mode: 'month', year: expandedYear, values } : null;
        }
        const values = buildLoopValues({ mode: 'year', rasterPeriodicity, periodicity });
        return values.length >= 2 ? { mode: 'year', values } : null;
    };

    const canPlay = !!layerId && (!!loopState || viewLoopConfig() != null || inferLoopConfig?.(layerId) != null);

    const handleTogglePeriodicityLoop = () => {
        if (!layerId) return;
        if (loopState?.isPlaying) {
            stopLoop?.(layerId);
            return;
        }
        const desiredMode = expandedYear != null ? 'month' : 'year';
        if (loopState && loopState.mode === desiredMode) {
            toggleLoop?.(layerId);
            return;
        }
        if (loopState) stopLoop?.(layerId);
        const config = viewLoopConfig() || inferLoopConfig?.(layerId);
        if (config) startLoop?.(layerId, config);
    };

    const togglePeriodicityLoopInSlot = (slot) => {
        if (!layerId) return;
        if (slot && compareMode?.active && compareMode.activeSlot !== slot && !loopState?.isPlaying) {
            setActiveSlot?.(slot);
            requestAnimationFrame(handleTogglePeriodicityLoop);
        } else handleTogglePeriodicityLoop();
    };

    const handleClearDateFilter = () => {
        if (!layerId) return;
        stopLoop?.(layerId);
        clearFilter(layerId, 'date');
    };

    if (!hasPeriodicity) return null;

    const renderSlotPeriodicity = (slot) => (
        <PeriodicitySection
            key={slot}
            layerId={layerId}
            slot={slot}
            label={`Lado ${slot}`}
            periodicity={periodicity}
            rasterPeriodicity={rasterPeriodicity}
            periodicityLoading={periodicityLoading}
            isAdvancedMode={isAdvancedMode}
            onAdvancedToggle={onAdvancedToggle}
            onFilterApply={makeSlotApply(slot)}
            onClearFilter={makeSlotClear(slot)}
            onClearDateFilter={makeSlotClear(slot)}
            onExpandedYearChange={compareMode.activeSlot === slot ? setExpandedYear : undefined}
            singleSelectOnly={singleSelectOnly}
            hasDateFilter={!!makeSlotGetFilter(slot)(layerId, 'date')}
            showLoopControls={true}
            canPlay={canPlay}
            isLoopPlaying={isLoopPlaying && compareMode.activeSlot === slot}
            layerIntervalMs={layerIntervalMs}
            layerDirection={layerDirection}
            onSetLoopIntervalMs={(ms) => setLoopIntervalMs(layerId, ms)}
            onSetLoopDirection={(dir) => setLoopDirection(layerId, dir)}
            onTogglePeriodicityLoop={() => togglePeriodicityLoopInSlot(slot)}
            getSpecificFilterOverride={makeSlotGetFilter(slot)}
            loopDisabled={isLoopPlaying && compareMode.activeSlot !== slot}
            loopDisabledHint={`Pausa la animación del lado ${slot === 'A' ? 'B' : 'A'} para iniciar acá`}
            loopAppliesToSlot={isLoopPlaying && compareMode.activeSlot === slot}
        />
    );

    const periodicitySection = slotMembership === 'AB'
        ? <>{['A', 'B'].map(renderSlotPeriodicity)}</>
        : (
            <PeriodicitySection
                layerId={layerId}
                slot={slotMembership === 'A' || slotMembership === 'B' ? slotMembership : undefined}
                label={slotMembership ? `Lado ${slotMembership}` : null}
                periodicity={periodicity}
                rasterPeriodicity={rasterPeriodicity}
                periodicityLoading={periodicityLoading}
                isAdvancedMode={isAdvancedMode}
                onAdvancedToggle={onAdvancedToggle}
                onFilterApply={slotMembership ? makeSlotApply(slotMembership) : handleDateFilterApply}
                onClearFilter={slotMembership ? makeSlotClear(slotMembership) : handleClearFilter}
                onClearDateFilter={slotMembership ? makeSlotClear(slotMembership) : handleClearDateFilter}
                onExpandedYearChange={setExpandedYear}
                singleSelectOnly={singleSelectOnly}
                hasDateFilter={hasDateFilter}
                showLoopControls={!slotMembership || slotMembership === compareMode?.activeSlot}
                canPlay={canPlay}
                isLoopPlaying={isLoopPlaying}
                loopAppliesToSlot={!slotMembership || (isLoopPlaying && slotMembership === compareMode?.activeSlot)}
                layerIntervalMs={layerIntervalMs}
                layerDirection={layerDirection}
                onSetLoopIntervalMs={(ms) => setLoopIntervalMs(layerId, ms)}
                onSetLoopDirection={(dir) => setLoopDirection(layerId, dir)}
                onTogglePeriodicityLoop={handleTogglePeriodicityLoop}
                getSpecificFilterOverride={slotMembership ? makeSlotGetFilter(slotMembership) : undefined}
            />
        );

    return (
        <div className="px-4.5 pb-2">
            <div ref={flashRef} className="rounded-2xl flex flex-col gap-4">
                {periodicitySection}
            </div>
        </div>
    );
};

export default LayerPeriodicityControls;
