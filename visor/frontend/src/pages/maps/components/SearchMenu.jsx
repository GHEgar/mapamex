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
        <div className={`pt-6 ${selectedLayers.length > 0 ? 'pb-2' : 'pb-6'} px-4 w-full ${HIDDEN_SCROLLBAR}`}>
            <div className="flex items-center justify-between">
                <h3 className="block text-[18px]/[47px] font-sans font-bold mb-2 text-primary tracking-normal">
                    Buscador
                </h3>
                {closeButton}
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué quieres buscar?"
                    className="
                        w-full py-4 pl-4 border-none bg-slate-100 rounded-2xl
                        text-[13px]/[19px] text-primary font-sans font-normal tracking-normal
                        placeholder:text-[#191919] placeholder:font-sans placeholder:font-normal placeholder:text-[13px]/[19px]
                        focus:outline-primary transition-colors
                    "
                />
                <button
                    className="
                        absolute right-0 top-1/2 -translate-y-1/2 h-full w-[51px]
                        bg-primary-deep rounded-r-2xl flex items-center justify-center
                    "
                >
                    {isLoading ? <Loading visible={true} size="w-5 h-5" border="border-2" color="border-white" /> : <Icon name="searchInput" className="size-7 text-white" />}
                </button>
            </div>

            {debouncedQuery && !isLoading && selectedLayers.length === 0 && (
                <div className="mt-6 text-center py-6">
                    <p className="text-[13px]/[19px] font-sans font-medium text-graphite">
                        No se encontraron resultados para <span className="font-bold text-primary">"{debouncedQuery}"</span>
                    </p>
                    <p className="text-[11px]/[16px] font-sans font-normal text-[#6E7477] mt-1">
                        Intenta con otro término de búsqueda
                    </p>
                </div>
            )}

            {selectedLayers.length > 0 && (
                <div className="relative mt-6 bg-white rounded-2xl p-2">
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
                                    <div className="text-[10px]/[11px] font-sans font-normal tracking-normal text-graphite px-1">
                                        {group.temaLabel} / {group.subtemaLabel}
                                    </div>
                                    <div className="space-y-0.5">
                                        {group.layers.map(layer => {
                                            const isActive = isLayerActive(layer.id);
                                            return (
                                                <button
                                                    key={layer.id}
                                                    onClick={() => handleLayerClick(layer.id)}
                                                    className={`
                                                        w-full flex items-center justify-start gap-3 px-2 py-1.5 rounded-2xl transition-all group cursor-pointer
                                                        hover:bg-secondary/10
                                                    `}
                                                >
                                                    <span className={`flex items-center justify-center w-3.5 h-3.5 rounded-2xl shrink-0 transition-colors ${isActive ? 'bg-primary-deep' : 'bg-slate-100'}`}>
                                                        <Icon name="check" className="w-2.5 h-2.5 text-white" visible={isActive} />
                                                    </span>
                                                    <span
                                                        className={`
                                                            text-[13px]/[19px] font-sans font-normal text-left tracking-normal inline-flex items-center gap-1.5 flex-wrap
                                                            ${isActive ? 'text-primary font-bold' : 'text-[#454545] group-hover:text-primary'
                                                }`}
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
