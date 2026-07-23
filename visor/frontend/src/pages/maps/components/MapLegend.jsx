import { useEffect, useMemo, useRef, useState } from 'react';
import { useMapsContext } from '@hooks/useMaps';
import { useSider } from '@contexts/SiderContext';
import { useWMSLegend } from '@hooksMaps/useWMSLegend';
import { useLayerMetadata } from '@hooksMaps/useLayerMetadata';
import { useLayerDownload } from '@hooksMaps/useLayerDownload';
import { HIDDEN_SCROLLBAR } from '@constants/global';
import { BRAND } from '@constants/brand';
import { trackOpacityChange } from '@services/analyticsService';
import DownloadMenu from '@mapsComponents/LayerDetailModal/components/DownloadMenu';
import LayerPeriodicityControls from './LayerPeriodicityControls';
import Logo from '@components/Logo';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import Bar from '@components/Bar';
import Switch from '@components/Switch';
import Loading from '@components/Loading';

const POSITION = `fixed z-[21] right-4 bottom-[54px] w-[calc(100vw-2rem)] md:w-[373px]`;
const TRACK_DEBOUNCE_MS = 500;

const LegendImage = ({ src, alt }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    if (!src || hasError) return null;
    return (
        <div className={`relative w-full ${isLoaded ? '' : 'min-h-10'}`}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Logo name="visor" isLoading size="size-10" />
                </div>
            )}
            <img
                src={src}
                alt={`Leyenda de ${alt}`}
                className={`max-w-full h-auto transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
                onError={(e) => {
                    setHasError(true);
                    e.target.style.display = 'none';
                }}
            />
        </div>
    );
};

const MapLegend = () => {
    const {
        selectedLayerForSymbology: layer,
        compareMode,
        findLayerById,
        getLayerOpacity,
        setLayerOpacity,
        setSelectedLayer,
        getFilter,
        getSpecificFilter,
        setActiveSlot,
        periodicityRequest,
    } = useMapsContext();
    const { hasLegend, getLegendUrl } = useWMSLegend();
    const { isMobile } = useSider();
    const [minimized, setMinimized] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const trackTimerRef = useRef(null);

    const layerId = layer?.id ?? null;

    useEffect(() => {
        if (minimized && layerId && periodicityRequest === layerId) setMinimized(false);
    }, [periodicityRequest, layerId, minimized]);

    const slotMembership = useMemo(() => {
        if (!compareMode?.active || !layer) return null;
        const ids = [layer.id, ...(layer.childIds || [])];
        const inA = (compareMode.paneA?.activeLayerIds || []).some(id => ids.includes(id));
        const inB = (compareMode.paneB?.activeLayerIds || []).some(id => ids.includes(id));
        if (inA && inB) return 'AB';
        if (inA) return 'A';
        if (inB) return 'B';
        return null;
    }, [compareMode, layer]);

    const fullLayer = layer ? (findLayerById?.(layer.id) || null) : null;
    const displayName = layer?.name || fullLayer?.name || fullLayer?.label || '';

    const showActionsBase = !minimized || (!isMobile && isHovered);
    const { metadata, loading: metadataLoading } = useLayerMetadata((layerId && showActionsBase) ? layerId : null);
    const download = useLayerDownload(layerId, { getFilter, getSpecificFilter, metadata });

    const effectiveOpacity = useMemo(() => {
        const own = getLayerOpacity?.(layerId) ?? 1;
        if (own !== 1) return own;
        const childIds = fullLayer?.childIds;
        if (childIds?.length) {
            for (const id of childIds) {
                const op = getLayerOpacity?.(id);
                if (op != null && op !== 1) return op;
            }
        }
        return own;
    }, [getLayerOpacity, layerId, fullLayer?.childIds]);
    const opacityPercent = Math.round((effectiveOpacity ?? 1) * 100);

    const canOpenModal = !!layerId && layerId !== 'curvas_de_nivel';
    const canDownload = metadata?.capa_descargable !== false;

    const handleOpacity = (e) => {
        const next = parseInt(e.target.value, 10) / 100;
        setLayerOpacity?.(layerId, next);
        if (trackTimerRef.current) clearTimeout(trackTimerRef.current);
        trackTimerRef.current = setTimeout(() => trackOpacityChange(layerId, next), TRACK_DEBOUNCE_MS);
    };

    const handleDownloadClick = () => {
        if (download.downloading) download.handleCancelDownload();
        else download.setMenuOpen(p => !p);
    };

    const handleDetails = () => { if (layer) setSelectedLayer?.(layer); };

    if (!layer) return null;

    let url = null;
    if (hasLegend(layer)) {
        const isSwipe = !!compareMode?.active;
        if (!isSwipe || !slotMembership) {
            url = getLegendUrl(layer, { transparent: true });
        } else {
            const activeSlot = slotMembership === 'AB'
                ? (compareMode.activeSlot === 'B' ? 'B' : 'A')
                : slotMembership;
            const slotDate = compareMode[activeSlot === 'A' ? 'paneA' : 'paneB']?.filters?.[layer.id]?.date;
            url = getLegendUrl(layer, { dateValue: slotDate, transparent: true });
        }
    }

    const showSlotSwitch = !!compareMode?.active && slotMembership === 'AB';

    const actionButtons = (
        <>
            {canOpenModal && (
                <Tooltip content="Ver detalles" placement="top">
                    <button
                        type="button"
                        onClick={handleDetails}
                        className="p-1.5 rounded-full text-gray-500 hover:text-primary-deep hover:bg-primary-soft transition-colors cursor-pointer shrink-0"
                        aria-label="Ver detalles"
                    >
                        <Icon name="big_card" className="size-5" />
                    </button>
                </Tooltip>
            )}
            <Tooltip content={download.downloading ? 'Cancelar descarga' : 'Descargar capa'} placement="top">
                <button
                    ref={download.menuAnchorRef}
                    type="button"
                    onClick={handleDownloadClick}
                    disabled={metadataLoading || !canDownload}
                    className="p-1.5 rounded-full text-gray-500 hover:text-primary-deep hover:bg-primary-soft transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Descargar capa"
                >
                    {download.downloading
                        ? <Loading visible size="size-5" border="border-2" />
                        : <Icon name="download" className="size-5" />}
                </button>
            </Tooltip>
        </>
    );

    const downloadPortal = canDownload && download.menuOpen ? (
        <DownloadMenu
            open={download.menuOpen}
            anchorRef={download.menuAnchorRef}
            onClose={() => download.setMenuOpen(false)}
            isRaster={download.isRaster}
            hasDateFilter={download.hasDateFilter}
            availableMetadata={download.availableMetadata}
            onDownload={download.handleMenuDownload}
        />
    ) : null;

    if (minimized) {
        const showHoverActions = !isMobile && (isHovered || download.menuOpen);
        return (
            <div className={`${POSITION} flex justify-end`}>
                <div
                    onMouseEnter={!isMobile ? () => setIsHovered(true) : undefined}
                    onMouseLeave={!isMobile ? () => { if (!download.menuOpen) setIsHovered(false); } : undefined}
                    className="max-w-full flex items-center gap-1 bg-white rounded-2xl shadow-lg pl-4.5 pr-2 py-2 hover:shadow-xl transition-shadow"
                >
                    <button
                        type="button"
                        onClick={() => setMinimized(false)}
                        title="Mostrar leyenda"
                        aria-label="Mostrar leyenda"
                        className="min-w-0 flex-1 flex items-center cursor-pointer py-1"
                    >
                        <span className="truncate font-sans font-bold text-[18px]/[24px] text-numeralia">
                            {displayName}
                        </span>
                    </button>
                    {showHoverActions && (
                        <div className="flex items-center gap-1 shrink-0">{actionButtons}</div>
                    )}
                </div>
                {downloadPortal}
            </div>
        );
    }

    return (
        <div className={POSITION}>
            <div className="w-full bg-white rounded-2xl shadow-lg overflow-x-hidden overflow-y-auto max-h-[calc(100dvh-5rem)]">
                <div className="flex items-center gap-3 px-4.5 py-2">
                    <Icon name="simbologia" state="normal" className="size-8 shrink-0" />
                    <h3 className="flex-1 min-w-0 truncate font-sans font-bold text-[18px]/[47px] text-numeralia" title={displayName}>
                        {displayName}
                    </h3>
                    <button
                        type="button"
                        onClick={() => setMinimized(true)}
                        title="Minimizar leyenda"
                        aria-label="Minimizar leyenda"
                        className="shrink-0 cursor-pointer"
                    >
                        <Icon name="zoomout" className="size-6" />
                    </button>
                </div>

                {showSlotSwitch && (
                    <div className="flex items-center gap-2 px-4.5 pb-1 text-[11px] font-sans text-graphite">
                        <span>Editando lado</span>
                        <Switch
                            checked={compareMode.activeSlot === 'A'}
                            onChange={(next) => setActiveSlot?.(next ? 'A' : 'B')}
                            onLabel="A"
                            offLabel="B"
                            onColor={BRAND.PRIMARY}
                            offColor={BRAND.SECONDARY}
                            tooltip={`Editando lado ${compareMode.activeSlot}`}
                        />
                    </div>
                )}

                <div className="flex items-center gap-2 px-4.5 pb-2">
                    <Icon name="opacity" className="size-5 shrink-0 text-gray-500" />
                    <Bar min={0} max={100} value={opacityPercent} onChange={handleOpacity} className="flex-1" />
                    <span className="text-[11px] font-sans font-bold tabular-nums text-graphite shrink-0 w-8 text-right">{opacityPercent}%</span>
                    <div className="flex items-center gap-1 shrink-0">{actionButtons}</div>
                </div>

                <LayerPeriodicityControls layerId={layer.id} />

                {url && (
                    <div className="px-4.5 pb-4 pt-1">
                        <div className={`bg-slate-50 rounded-xl p-3 max-h-[38vh] overflow-auto ${HIDDEN_SCROLLBAR}`}>
                            <LegendImage src={url} alt={displayName} />
                        </div>
                    </div>
                )}
            </div>
            {downloadPortal}
        </div>
    );
};

export default MapLegend;
