import { useRef } from 'react';
import { BRAND } from '@constants/brand';
import Panel from '@components/Panel';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import Bar from '@components/Bar';
import Switch from '@components/Switch';
import Loading from '@components/Loading';
import Divider from '@components/Divider';
import { useLegendsVisibility } from './hooks/useLegendsVisibility';
import { useMapsContext } from '@hooks/useMaps';
import { trackOpacityChange } from '@services/analyticsService';

const TRACK_DEBOUNCE_MS = 500;

const Row = ({ children, onClick, disabled = false }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}`}
    >
        {children}
    </button>
);

const LayerItemMenu = ({
    layerId,
    open,
    onToggle,
    onClose,
    kebabRef,
    visible,
    isLoading,
    isLooping,
    canOpenModal,
    opacity = 1,
    hasLegend = false,
    slotMembership = null,
    activeSlot = null,
    canDownload = false,
    metadataLoading = false,
    isDownloading = false,
    onToggleVisibility,
    onOpenDetails,
    onChangeOpacity,
    onDownloadClick,
    onSwitchSlot,
}) => {
    const trackTimerRef = useRef(null);
    const { visible: legendsVisible, setVisible: setLegendsVisible } = useLegendsVisibility();
    const { setHighlightedSlots } = useMapsContext();

    const opacityPercent = Math.round((opacity ?? 1) * 100);
    const showDetails = (!isLoading || isLooping) && canOpenModal;

    const handleOpacity = (e) => {
        const next = parseInt(e.target.value, 10) / 100;
        onChangeOpacity?.(next);
        if (trackTimerRef.current) clearTimeout(trackTimerRef.current);
        trackTimerRef.current = setTimeout(() => trackOpacityChange(layerId, next), TRACK_DEBOUNCE_MS);
    };

    const handleSwitchSlot = (next) => {
        const target = next ? 'A' : 'B';
        onSwitchSlot?.(target);
        setHighlightedSlots?.(target);
        setTimeout(() => setHighlightedSlots?.(null), 1500);
    };

    return (
        <>
            <Tooltip content="Acciones de capa">
                <button
                    ref={kebabRef}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                    className="p-1.5 rounded-full transition-colors cursor-pointer text-gray-500 hover:text-primary-deep hover:bg-primary-soft shrink-0"
                    aria-label="Acciones de capa"
                    aria-haspopup="menu"
                    aria-expanded={open}
                >
                    <Icon name="opciones" className="size-5" />
                </button>
            </Tooltip>

            <Panel
                open={open}
                anchorRef={kebabRef}
                onClose={onClose}
                variant="menu"
                disableMobileFullscreen
                width="w-60"
                className="rounded-2xl"
                placement="bottom-end"
                role="menu"
            >
                <div className="flex flex-col p-2">
                    <Row onClick={(e) => onToggleVisibility?.(e)}>
                        <Icon name="visible" state={visible ? 'gray' : 'hover'} className="size-5 shrink-0" />
                        <span className="font-sans font-medium text-sm text-graphite">{visible ? 'Ocultar capa' : 'Mostrar capa'}</span>
                    </Row>

                    {showDetails && (
                        <Row onClick={(e) => onOpenDetails?.(e)}>
                            <Icon name="big_card" className="size-5 shrink-0" />
                            <span className="font-sans font-medium text-sm text-graphite">Ver detalles</span>
                        </Row>
                    )}

                    <div className="flex items-center gap-3 px-3 py-2.5">
                        <Icon name="opacity" className="size-5 shrink-0 text-gray-500" />
                        <span className="font-sans font-medium text-sm text-graphite shrink-0">Opacidad</span>
                        <Bar min={0} max={100} value={opacityPercent} onChange={handleOpacity} className="flex-1" />
                        <span className="text-[11px] font-sans font-bold tabular-nums text-graphite shrink-0 w-8 text-right">{opacityPercent}%</span>
                    </div>

                    <Row onClick={(e) => { e.stopPropagation(); onDownloadClick?.(); }} disabled={metadataLoading || !canDownload}>
                        {metadataLoading ? (
                            <Loading visible size="size-5" border="border-2" />
                        ) : (
                            <Icon name="download" className="size-5 shrink-0 text-gray-500" />
                        )}
                        <span className="font-sans font-medium text-sm text-graphite">
                            {isDownloading ? 'Descargando…' : metadataLoading ? 'Cargando…' : 'Descargar capa'}
                        </span>
                    </Row>

                    {hasLegend && (
                        <Row onClick={(e) => { e.stopPropagation(); setLegendsVisible(p => !p); }}>
                            <Icon name="simbologia" state={legendsVisible ? 'normal' : 'gray'} className="size-5 shrink-0" />
                            <span className="font-sans font-medium text-sm text-graphite flex-1">Leyenda</span>
                            <span className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${legendsVisible ? 'bg-primary' : 'bg-slate-300'}`}>
                                <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${legendsVisible ? 'left-4' : 'left-0.5'}`} />
                            </span>
                        </Row>
                    )}

                    {slotMembership === 'AB' && (
                        <>
                            <Divider className="my-1.5" />
                            <div className="flex items-center justify-between px-3 py-1.5">
                                <span className="font-sans font-medium text-sm text-graphite">Editando lado</span>
                                <Switch
                                    checked={activeSlot === 'A'}
                                    onChange={handleSwitchSlot}
                                    onLabel="A"
                                    offLabel="B"
                                    onColor={BRAND.PRIMARY}
                                    offColor={BRAND.SECONDARY}
                                    tooltip={`Editando lado ${activeSlot} — cambiar a ${activeSlot === 'A' ? 'B' : 'A'}`}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Panel>
        </>
    );
};

export default LayerItemMenu;
