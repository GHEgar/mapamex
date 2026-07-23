import { useContext, useState, useEffect, useMemo } from 'react';
import { trackLayerDetailOpen } from '@services/analyticsService';
import { useLayerMetadata } from '../../hooks/useLayerMetadata';
import MapsContext from '@contexts/MapsContext';
import { useEventoContext } from '@hooks/useEvento';
import { findLayerDef, findLayerTheme } from '../../helpers/wmsConfig';
import { formatDateString } from '../../helpers/dateFilterHelpers';
import StatCard from './components/StatCard';
import LayerInfoSections, { hasLayerInfoContent } from './components/LayerInfoSections';
import LayerThemeAvatar from './components/LayerThemeAvatar';
import SectionTabs from './components/SectionTabs';
import Icon from '@components/Icon';
import Logo from '@components/Logo';

const LayerDetailModal = () => {
    const { selectedLayer, setSelectedLayer, allLayers } = useContext(MapsContext);
    const { activeEvento, getAliasByLayerId, findEventoByLayerId } = useEventoContext();

    const layerDef = useMemo(() => {
        if (!selectedLayer?.id) return null;
        return findLayerDef(selectedLayer.id, allLayers);
    }, [selectedLayer?.id, allLayers]);
    const themeNode = useMemo(() => {
        if (!selectedLayer?.id) return null;
        return findLayerTheme(selectedLayer.id, allLayers);
    }, [selectedLayer?.id, allLayers]);
    const { metadata, loading } = useLayerMetadata(selectedLayer?.id);
    const themeName = themeNode?.label || metadata?.tema || 'General';

    const eventoMatch = useMemo(() => {
        const layerId = selectedLayer?.id;
        if (!layerId) return null;
        const fromActive = activeEvento?.layerIds?.includes(layerId)
            && (activeEvento.iconoUrl || activeEvento.imagenUrl) ? activeEvento : null;
        if (fromActive) return fromActive;
        const fromList = findEventoByLayerId?.(layerId);
        return fromList && (fromList.iconoUrl || fromList.imagenUrl) ? fromList : null;
    }, [activeEvento, selectedLayer?.id, findEventoByLayerId]);

    const subtitleLabel = eventoMatch?.titulo || themeName;
    const avatarImageUrl = eventoMatch ? (eventoMatch.iconoUrl || eventoMatch.imagenUrl) : null;
    const titleLabel = getAliasByLayerId?.(selectedLayer?.id) || selectedLayer?.name || selectedLayer?.label || layerDef?.label || 'Capa sin nombre';

    const numeraliaStats = useMemo(
        () => (metadata?.numeralia || []).filter(s => s.nombre || s.valor),
        [metadata]
    );
    const hasNumeralia = numeraliaStats.length > 0;
    const hasInfo = hasLayerInfoContent(metadata);

    const tabs = useMemo(() => {
        const list = [];
        if (hasNumeralia) list.push({ key: 'numeralia', label: 'Numeralia' });
        if (hasInfo) list.push({ key: 'info', label: 'Información' });
        return list;
    }, [hasNumeralia, hasInfo]);

    const [activeTab, setActiveTab] = useState(null);
    useEffect(() => {
        setActiveTab(prev => (prev && tabs.some(t => t.key === prev)) ? prev : (tabs[0]?.key ?? null));
    }, [tabs]);

    useEffect(() => {
        if (selectedLayer?.id && !selectedLayer?.silent) trackLayerDetailOpen(selectedLayer.id);
    }, [selectedLayer?.id, selectedLayer?.silent]);

    const [entered, setEntered] = useState(false);
    useEffect(() => {
        if (!selectedLayer) { setEntered(false); return undefined; }
        const raf = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(raf);
    }, [selectedLayer]);

    if (!selectedLayer) return null;

    return (
        <div className="fixed inset-y-0 right-0 sm:right-4 z-30 w-full sm:w-[643px] pointer-events-none flex items-center">
            <div className={`w-full max-h-[calc(100dvh-2rem)] bg-white shadow-lg backdrop-blur-sm overflow-y-auto pointer-events-auto rounded-2xl scrollbar-thin scrollbar-thumb-gray-400 will-change-transform transition duration-250 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none ${entered ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-full opacity-0 max-md:translate-x-0 max-md:translate-y-full'}`}>
                {loading ? (
                    <div className="flex items-center justify-center min-h-60">
                        <Logo name="visor" size="size-36" isLoading />
                    </div>
                ) : (
                    <>
                        <div className="sticky top-0 z-10 bg-white backdrop-blur-sm px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
                            <div className="flex items-center gap-3">
                                <LayerThemeAvatar name={subtitleLabel} imageUrl={avatarImageUrl} size="md" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-[18px]/[24px] font-sans font-extrabold text-primary tracking-normal">
                                            {titleLabel}
                                        </h3>
                                        <Icon name="cerrarModal" aria-label="Cerrar" onClick={() => setSelectedLayer(null)} classNameBG="rounded-full hover:shadow-lg" className="cursor-pointer size-8 shrink-0" />
                                    </div>
                                    <span className="block text-[14px]/[20px] font-sans font-bold text-graphite tracking-normal">
                                        {subtitleLabel}
                                    </span>
                                </div>
                            </div>

                            {(metadata?.frecuencia_actualizacion || metadata?.fecha_ultima_actualizacion) && (
                                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 mt-6 px-1 text-[13px] font-sans text-numeralia">
                                    {metadata?.frecuencia_actualizacion && (
                                        <span><span className="font-medium">Periodicidad:</span> <span className="font-bold">{metadata.frecuencia_actualizacion}</span></span>
                                    )}
                                    {metadata?.fecha_ultima_actualizacion && (
                                        <span><span className="font-medium">Actualización:</span> <span className="font-bold">{formatDateString(metadata.fecha_ultima_actualizacion)}</span></span>
                                    )}
                                </div>
                            )}

                            {metadata?.descripcion && (
                                <p className="mt-5 text-[14px]/[24px] text-left font-sans font-medium text-graphite tracking-normal">
                                    {metadata.descripcion}
                                </p>
                            )}

                            {tabs.length > 1 && (
                                <div className="mt-4">
                                    <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
                                </div>
                            )}
                        </div>

                        <div className="px-4 pb-6 pt-4 sm:px-6">
                            {activeTab === 'numeralia' && hasNumeralia && (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {numeraliaStats.map((stat, index) => (
                                            <StatCard key={index} label={stat.nombre} value={stat.valor} simbolo={stat.simbolo} />
                                        ))}
                                    </div>
                                    {metadata?.nombre_pie_numeralia && (
                                        <p className="text-[10px]/[11px] font-sans font-medium text-graphite tracking-normal mt-6">
                                            {metadata.nombre_pie_numeralia}
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'info' && hasInfo && (
                                <LayerInfoSections metadata={metadata} layerName={selectedLayer.name} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LayerDetailModal;
