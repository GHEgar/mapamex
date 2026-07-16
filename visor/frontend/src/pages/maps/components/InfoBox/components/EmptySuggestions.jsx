import { useEffect } from 'react';
import InfoCard from './InfoCard';
import { useLayerSymbolIcon } from '@hooksMaps/useLayerSymbolIcon';
import { useMapsContext } from '@hooks/useMaps';
import { trackInfoBoxAction } from '@services/analyticsService';

const SymbolIcon = ({ url, className = 'size-5' }) => {
    if (!url) return null;
    return (
        <img
            src={url}
            alt=""
            className={`${className} rounded-2xl shrink-0 object-cover object-top`}
            onError={(e) => { e.target.style.display = 'none'; }}
        />
    );
};

const AlternativeButton = ({ layer, isMobile, onSelect, onPulse, onPulseEnd }) => {
    const symbolUrl = useLayerSymbolIcon(layer.id);
    const textSize = isMobile ? 'text-xs' : 'text-[11px]/[14px]';
    const badgeSize = isMobile ? 'text-[11px]/[14px]' : 'text-[10px]/[14px]';

    return (
        <button
            onClick={() => onSelect(layer)}
            onMouseEnter={isMobile ? undefined : () => onPulse(layer.id)}
            onMouseLeave={isMobile ? undefined : () => onPulseEnd()}
            className="group w-full flex items-center justify-between pl-4 pr-2 py-2 bg-primary-soft hover:bg-primary-deep rounded-2xl cursor-pointer transition-all hover:shadow-lg"
        >
            <span className="flex items-center gap-1.5 min-w-0">
                <SymbolIcon url={symbolUrl} className="size-4" />
                <span className={`font-sans font-medium ${textSize} text-primary group-hover:text-white truncate`}>
                    {layer.name}
                </span>
            </span>
            <span className={`font-sans font-bold ${badgeSize} text-secondary bg-white px-2 py-0.5 rounded-full shrink-0 ml-2`}>
                {layer.count}
            </span>
        </button>
    );
};

const EmptySuggestions = ({ visible = true, queriedLayerName, queriedLayerId, alternativeLayers, onSelectLayer, onClose, variant = 'desktop' }) => {
    const { pulseLayer, cancelPulse } = useMapsContext();
    const symbolUrl = useLayerSymbolIcon(queriedLayerId, visible && !!queriedLayerName);

    useEffect(() => {
        if (!visible) return;
        trackInfoBoxAction('empty_suggestions_view', queriedLayerId || null);
    }, [visible, queriedLayerId]);

    useEffect(() => () => cancelPulse?.(), [cancelPulse]);

    if (!visible) return null;

    const hasAlternatives = alternativeLayers && alternativeLayers.length > 0;
    const isMobile = variant === 'mobile';
    const padX = isMobile ? 'px-5' : 'p-4';

    const handleSelect = (layer) => {
        cancelPulse?.();
        onSelectLayer(layer);
    };

    return (
        <InfoCard
            title={queriedLayerName || 'Información disponible'}
            variant={variant}
            onClose={onClose}
        >
            <div className={`${padX} pb-4`}>
                {queriedLayerName && (
                    <p className={`font-sans font-medium ${isMobile ? 'text-xs' : 'text-[11px]/[14px]'} text-graphite text-center mb-3`}>
                        <SymbolIcon url={symbolUrl} className="inline-block size-5 align-middle mr-1.5" />
                        La capa seleccionada no tiene información en este punto.
                    </p>
                )}

                {hasAlternatives ? (
                    <>
                        <p className={`font-sans font-medium ${isMobile ? 'text-xs' : 'text-[10px]/[14px]'} text-graphite mb-2`}>
                            {queriedLayerName ? 'Capas con datos aquí:' : 'Capas con datos en este punto:'}
                        </p>
                        <div className="space-y-1.5">
                            {alternativeLayers.map((layer) => (
                                <AlternativeButton
                                    key={layer.id}
                                    layer={layer}
                                    isMobile={isMobile}
                                    onSelect={handleSelect}
                                    onPulse={pulseLayer}
                                    onPulseEnd={cancelPulse}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <p className={`font-sans font-medium ${isMobile ? 'text-xs' : 'text-[10px]/[14px]'} text-slate-400 text-center italic`}>
                        No hay datos de ninguna capa activa en este punto
                    </p>
                )}
            </div>
        </InfoCard>
    );
};

export default EmptySuggestions;
