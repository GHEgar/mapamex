import { useState, useRef } from 'react';
import { BRAND } from '@constants/brand';
import Panel from '@components/Panel';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import Divider from '@components/Divider';
import Switch from '@components/Switch';
import ConfirmDropdown from '@components/ConfirmDropdown';

const MenuRow = ({ icon, iconState = 'normal', label, onClick, disabled = false, count = 0, danger = false }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}`}
    >
        <Icon name={icon} state={iconState} className={`size-5 shrink-0 ${danger ? 'text-secondary' : ''}`} />
        <span className={`font-sans font-medium text-sm ${danger ? 'text-secondary' : 'text-graphite'}`}>{label}</span>
        {count > 0 && (
            <span className={`ml-auto font-sans font-semibold text-xs tabular-nums ${danger ? 'text-secondary' : 'text-graphite'}`}>{count}</span>
        )}
    </button>
);

const ActiveLayersMenu = ({
    noLayers,
    unifiedLayers,
    allHidden,
    visibilityCount,
    hasActiveLoops,
    activeLoopsCount,
    isInegiMode,
    onToggleVisibilityAll,
    onRemoveAll,
    onPauseAll,
    onToggleBaseMode,
    onOpenSearch,
    onAnyPanelOpenChange,
}) => {
    const kebabRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const closeMenu = () => {
        setShowDeleteConfirm(false);
        setMenuOpen(false);
    };

    const handleSearch = () => {
        closeMenu();
        onOpenSearch();
    };

    const handleToggleVisibility = () => {
        onToggleVisibilityAll();
        closeMenu();
    };

    const handlePause = () => {
        onPauseAll();
        closeMenu();
    };

    return (
        <>
            <Tooltip content="Acciones de capas">
                <button
                    ref={kebabRef}
                    type="button"
                    onClick={() => { setMenuOpen(o => !o); onAnyPanelOpenChange?.(!menuOpen); }}
                    className="size-9 flex items-center justify-center rounded-full transition-colors hover:bg-slate-100 cursor-pointer"
                    aria-label="Acciones de capas"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                >
                    <Icon name="opciones" className="size-6 text-graphite" />
                </button>
            </Tooltip>

            <Panel
                open={menuOpen}
                anchorRef={kebabRef}
                onClose={closeMenu}
                variant="solid"
                width="w-64"
                className="z-50 mt-2 rounded-2xl"
                placement="bottom-end"
                mobileFullscreen={false}
                hideHeader
                noPadding
                role="menu"
            >
                <div className="flex flex-col p-2">
                    <div className="relative">
                        <MenuRow
                            icon="eliminar"
                            label="Eliminar mis capas"
                            onClick={() => setShowDeleteConfirm(p => !p)}
                            disabled={noLayers}
                            count={unifiedLayers.length}
                            danger
                        />
                        <ConfirmDropdown
                            open={showDeleteConfirm}
                            onClose={() => setShowDeleteConfirm(false)}
                            onConfirm={() => { onRemoveAll(); closeMenu(); }}
                            title="¿Estás seguro de borrar todas las capas que tienes activas?"
                            description="Si las borras deberás activar una por una nuevamente"
                            confirmText="Sí. Quiero borrar todas las capas"
                            className="left-1/2 -translate-x-1/2"
                        />
                    </div>
                    <MenuRow
                        icon="visible"
                        iconState={allHidden ? 'hover' : 'gray'}
                        label={allHidden ? 'Mostrar mis capas' : 'Ocultar mis capas'}
                        onClick={handleToggleVisibility}
                        disabled={noLayers}
                        count={visibilityCount}
                    />
                    <MenuRow
                        icon="searchLayer"
                        label="Buscar capas"
                        onClick={handleSearch}
                        disabled={noLayers}
                    />
                    {hasActiveLoops && (
                        <MenuRow
                            icon="pause_all"
                            label="Pausar animaciones"
                            onClick={handlePause}
                            count={activeLoopsCount}
                        />
                    )}

                    <Divider className="my-1.5" />

                    <div className="flex items-center justify-between px-3 py-1.5">
                        <span className="font-sans font-medium text-sm text-graphite">Capas base</span>
                        <Switch
                            checked={!isInegiMode}
                            onChange={onToggleBaseMode}
                            onLabel="IIEG"
                            offLabel="INEGI"
                            onColor={noLayers ? '#d1d5db' : BRAND.PRIMARY_DEEP}
                            offColor={BRAND.SECONDARY}
                            tooltip={noLayers ? 'Activar capas IIEG' : (isInegiMode ? 'Cambiar a IIEG' : 'Cambiar a INEGI')}
                        />
                    </div>
                </div>
            </Panel>
        </>
    );
};

export default ActiveLayersMenu;
