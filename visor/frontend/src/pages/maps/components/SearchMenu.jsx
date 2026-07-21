import { useState, useEffect, useRef, useMemo } from 'react';
import { getSearchConfig } from '@services/searchConfig';
import { searchGlobal } from '@services/searchService';
import { trackLayerSearch } from '@services/analyticsService';
import { useDebounce } from '@hooks/useDebounce';
import { useSearch } from '@contexts/SearchContext';
import { useLayers } from '@hooks/useLayers';
import { buildLayerIndex } from '@pages/maps/helpers/badgeHelpers';
import Icon from '@components/Icon';
import Loading from '@components/Loading';
import ScrollContainer from '@components/ScrollContainer';
import LayerBadge from '@mapsComponents/LayerBadge';
import { HIDDEN_SCROLLBAR } from '@constants/global';

const SearchMenu = ({ onToggleLayer, activeLayerIds = [], closeButton }) => {
    const { initialSearchQuery, consumeInitialQuery } = useSearch();
    const { layers } = useLayers();
    const layerIndex = useMemo(() => buildLayerIndex(layers), [layers]);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 500);
    const [selectedLayers, setSelectedLayers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!initializedRef.current && initialSearchQuery) {
            initializedRef.current = true;
            setSearchQuery(initialSearchQuery);
            consumeInitialQuery();
        }
    }, [initialSearchQuery, consumeInitialQuery]);

    const isLayerActive = (layerId) => {
        return activeLayerIds.includes(layerId);
    };

    const handleLayerClick = (layerId) => {
        const isActive = isLayerActive(layerId);
        onToggleLayer(layerId, !isActive);
    };

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery) {
                setIsLoading(true);
                const results = await searchGlobal(debouncedQuery, {
                    includeLayerNames: true,
                    includeLayerData: false,
                    minScore: 10
                });

                const matches = results.layerMatches;

                if (matches.length > 0) {
                    const newLayerIds = matches.map(m => m.layerId);
                    setSelectedLayers(newLayerIds);
                    trackLayerSearch(debouncedQuery);
                } else {
                    setSelectedLayers([]);
                }
                setIsLoading(false);
            } else {
                setSelectedLayers([]);
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);


    return (
        <div className={`py-5 px-4 w-full ${HIDDEN_SCROLLBAR}`}>
            <div className="flex items-center justify-between min-h-8 mb-3">
                <h3 className="font-sans font-bold text-[15px]/[20px] text-numeralia tracking-normal">
                    Buscador
                </h3>
                {closeButton}
            </div>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    {isLoading
                        ? <Loading visible={true} size="size-5" border="border-2" />
                        : <Icon name="search" className="size-5 text-graphite" />}
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué quieres buscar?"
                    className="
                        w-full py-3.5 pl-12 pr-4 border-none bg-slate-100 rounded-full
                        text-[13px]/[19px] text-numeralia font-sans font-normal tracking-normal
                        placeholder:text-graphite placeholder:font-normal
                        focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 transition-colors
                    "
                />
            </div>

            {debouncedQuery && !isLoading && selectedLayers.length === 0 && (
                <div className="mt-6 text-center py-6">
                    <p className="text-[13px]/[19px] font-sans font-medium text-graphite">
                        No se encontraron resultados para <span className="font-bold text-primary">"{debouncedQuery}"</span>
                    </p>
                    <p className="text-[11px]/[16px] font-sans font-normal text-graphite mt-1">
                        Intenta con otro término de búsqueda
                    </p>
                </div>
            )}

            {selectedLayers.length > 0 && (
                <div className="relative mt-4">
                    <ScrollContainer className="max-h-100 space-y-3">
                        {(() => {
                            const grouped = {};

                            selectedLayers.forEach(layerId => {
                                const config = getSearchConfig(layerId);
                                if (!config) return;

                                const temaLabel = config.temaLabel || 'Otros';
                                const subtemaLabel = config.subtemaLabel || 'General';
                                const groupKey = `${temaLabel}|||${subtemaLabel}`;

                                if (!grouped[groupKey]) {
                                    grouped[groupKey] = {
                                        temaLabel,
                                        subtemaLabel,
                                        layers: []
                                    };
                                }

                                grouped[groupKey].layers.push({
                                    id: layerId,
                                    label: config.label || layerId
                                });
                            });

                            return Object.entries(grouped).map(([groupKey, group]) => (
                                <div key={groupKey} className="space-y-1">
                                    <div className="text-[10px]/[14px] font-sans font-semibold tracking-normal text-graphite px-2">
                                        {group.temaLabel} / {group.subtemaLabel}
                                    </div>
                                    <div className="space-y-0.5">
                                        {group.layers.map(layer => {
                                            const isActive = isLayerActive(layer.id);
                                            return (
                                                <button
                                                    key={layer.id}
                                                    onClick={() => handleLayerClick(layer.id)}
                                                    aria-pressed={isActive}
                                                    className="w-full flex items-center justify-start gap-3 px-2 py-2 rounded-2xl transition-colors group cursor-pointer hover:bg-slate-100"
                                                >
                                                    <span className={`flex items-center justify-center size-4.5 rounded-full shrink-0 border-2 transition-colors ${isActive ? 'bg-primary-deep border-primary-deep' : 'bg-white border-slate-300'}`}>
                                                        <Icon name="check" className="size-2.5 text-white" visible={isActive} />
                                                    </span>
                                                    <span
                                                        className={`text-[13px]/[19px] font-sans text-left tracking-normal inline-flex items-center gap-1.5 flex-wrap ${isActive ? 'text-primary font-bold' : 'text-numeralia font-medium group-hover:text-primary'}`}
                                                    >
                                                        {layer.label}
                                                        <LayerBadge badge={layerIndex.get(layer.id)?.badge} />
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ));
                        })()}
                    </ScrollContainer>
                </div>
            )}
        </div>
    );
};

export default SearchMenu;
