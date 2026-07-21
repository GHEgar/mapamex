import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';

const ActiveLayersSearchBar = ({
    searchOpen,
    searchQuery,
    isFiltering,
    displayedLayers,
    unifiedLayers,
    onChangeSearchQuery,
    onCloseSearch,
    onSearchKeyDown,
    searchInputRef,
}) => {
    if (!searchOpen) return null;

    return (
        <div className="relative mb-2 shrink-0">
            <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Buscar capas activas"
                className="
                w-full py-3 pl-4 pr-20 border-none bg-slate-100 rounded-2xl
                text-[13px]/[19px] text-primary font-sans font-normal tracking-normal
                placeholder:text-[#191919] placeholder:font-sans placeholder:font-normal placeholder:text-[13px]/[19px]
                focus:outline-primary transition-colors
            "
            />
            {isFiltering && (
                <span className="absolute right-15 top-1/2 -translate-y-1/2 text-[11px] font-sans text-graphite pointer-events-none">
                    {displayedLayers.length}/{unifiedLayers.length}
                </span>
            )}
            <Tooltip content="Cerrar y limpiar búsqueda">
                <button
                    type="button"
                    aria-label="Cerrar y limpiar búsqueda"
                    onClick={onCloseSearch}
                    className="
                    absolute right-0 top-1/2 -translate-y-1/2 h-full w-12.75
                    bg-primary-deep hover:bg-primary rounded-r-2xl
                    flex items-center justify-center transition-colors cursor-pointer
                "
                >
                    <Icon name="searchInput" className="size-5" />
                </button>
            </Tooltip>
        </div>
    );
};

export default ActiveLayersSearchBar;
