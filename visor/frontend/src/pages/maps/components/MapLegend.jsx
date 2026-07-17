import { useEffect, useMemo, useState } from 'react';
import { useMapsContext } from '@hooks/useMaps';
import { useWMSLegend } from '@hooksMaps/useWMSLegend';
import { useLegendsVisibility } from './ActiveLayers/hooks/useLegendsVisibility';
import { HIDDEN_SCROLLBAR } from '@constants/global';
import Logo from '@components/Logo';
import Icon from '@components/Icon';

const POSITION = 'fixed z-10 right-4 bottom-20 md:bottom-9 w-[calc(100vw-2rem)] md:w-[373px]';

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
    const { selectedLayerForSymbology: layer, compareMode, findLayerById } = useMapsContext();
    const { hasLegend, getLegendUrl } = useWMSLegend();
    const { visible } = useLegendsVisibility();
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        setMinimized(false);
    }, [layer?.id]);

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

    if (!visible || !layer || !hasLegend(layer)) return null;

    const isSwipe = !!compareMode?.active;
    let url;
    if (!isSwipe || !slotMembership) {
        url = getLegendUrl(layer, { transparent: true });
    } else {
        const activeSlot = slotMembership === 'AB'
            ? (compareMode.activeSlot === 'B' ? 'B' : 'A')
            : slotMembership;
        const slotDate = compareMode[activeSlot === 'A' ? 'paneA' : 'paneB']?.filters?.[layer.id]?.date;
        url = getLegendUrl(layer, { dateValue: slotDate, transparent: true });
    }
    if (!url) return null;

    if (minimized) {
        return (
            <div className={`${POSITION} flex justify-end`}>
                <button
                    type="button"
                    onClick={() => setMinimized(false)}
                    title="Mostrar leyenda"
                    aria-label="Mostrar leyenda"
                    className="max-w-full flex items-center bg-white rounded-2xl shadow-lg px-4.5 py-3 cursor-pointer hover:shadow-xl transition-shadow"
                >
                    <span className="truncate font-sans font-bold text-[12px]/[16px] text-numeralia">
                        {displayName}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className={POSITION}>
            <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
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
                <div className="px-4.5 pb-4 pt-1">
                    <div className={`bg-slate-50 rounded-xl p-3 max-h-[38vh] overflow-auto ${HIDDEN_SCROLLBAR}`}>
                        <LegendImage src={url} alt={displayName} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapLegend;
