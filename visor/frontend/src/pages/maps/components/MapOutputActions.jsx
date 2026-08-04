import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import Download from './MapExport/Download';
import MunicipioFilterButton from './MapExport/MunicipioFilterButton';
import ShareButton from './ShareButton';
import ShareActiveChip from './ShareActiveChip';
import Icon from '@components/Icon';
import ExportPreview from './MapExport/ExportPreview';
import { useShareDirtiness } from '@pages/maps/hooks/useShareDirtiness';
import { DEFAULT_ESTADO, JALISCO_ESTADO } from '@pages/maps/hooks/useEstadoMode';
import { useMapsContext } from '@hooks/useMaps';

const IS_NON_PROD = ['dev', 'beta'].includes(import.meta.env.VITE_APP_ENV);

const RAIL_CLASS = 'absolute right-full top-2 mr-3 z-10 flex flex-col items-end gap-2 pointer-events-auto max-md:right-0 max-md:top-auto max-md:bottom-full max-md:mr-0 max-md:mb-2 max-md:flex-row max-md:items-center';

const MapOutputActions = ({ onAnyPanelOpenChange, className }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [isMunicipioOpen, setIsMunicipioOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const { municipioMode, estadoMode } = useMapsContext();
    const [previewFormat, setPreviewFormat] = useState('png');
    const [previewLegends, setPreviewLegends] = useState([]);
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewQuality, setPreviewQuality] = useState(null);
    const [previewSwipeOptions, setPreviewSwipeOptions] = useState(null);
    const { isDirty, loadedShareId, markPending } = useShareDirtiness();
    const inSyncWithShare = !!loadedShareId && !isDirty;
    const isModifiedFromShare = !!loadedShareId && isDirty;

    const isAnyPanelOpen = isDownloadOpen || isMunicipioOpen || isShareOpen || isPreviewOpen;
    useEffect(() => {
        onAnyPanelOpenChange?.(isAnyPanelOpen);
    }, [isAnyPanelOpen, onAnyPanelOpenChange]);

    const handleRevert = useCallback(() => {
        window.location.reload();
    }, []);

    const [searchParams, setSearchParams] = useSearchParams();
    const handleClearShare = useCallback(() => {
        const next = new URLSearchParams(searchParams);
        next.delete('s');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const handleOpenPreview = (format, selectedLegends, title, quality, swipeOptions) => {
        setPreviewFormat(format || 'png');
        setPreviewLegends(Array.isArray(selectedLegends) ? selectedLegends : (selectedLegends ? [selectedLegends] : []));
        setPreviewTitle(title || '');
        setPreviewQuality(quality || null);
        setPreviewSwipeOptions(swipeOptions || null);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
    };

    return (
        <>
            <div className={className ?? RAIL_CLASS}>
                {inSyncWithShare && (
                    <ShareActiveChip loadedShareId={loadedShareId} onMarkPending={markPending} />
                )}
                {isModifiedFromShare && (
                    <div className="hidden md:flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={handleRevert}
                            className="h-9 flex items-center px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-400 shadow-lg text-[11px]/[16px] font-sans whitespace-nowrap cursor-pointer transition-colors"
                            title={`Volver al estado del enlace ${loadedShareId}`}
                        >
                            Regresar a: <span className="font-bold tabular-nums ml-1">{loadedShareId}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleClearShare}
                            className="size-9 flex items-center justify-center rounded-full bg-primary-soft hover:bg-primary hover:text-white border border-transparent hover:border-primary transition-all cursor-pointer shrink-0 shadow-lg"
                            aria-label="Quitar enlace compartido"
                        >
                            <Icon name="close" className="size-4 text-inherit" />
                        </button>
                    </div>
                )}
                <Download
                    onOpenPreview={handleOpenPreview}
                    onOpenChange={setIsDownloadOpen}
                    collapsed
                />
                {IS_NON_PROD && (estadoMode?.activeEstado ?? DEFAULT_ESTADO) === JALISCO_ESTADO && (
                    <MunicipioFilterButton
                        municipioMode={municipioMode}
                        onOpenChange={setIsMunicipioOpen}
                        collapsed
                    />
                )}
                <ShareButton onOpenChange={setIsShareOpen} />
            </div>
            {isPreviewOpen && (
                <ExportPreview
                    isOpen={isPreviewOpen}
                    onClose={handleClosePreview}
                    format={previewFormat}
                    selectedLegends={previewLegends}
                    initialTitle={previewTitle}
                    quality={previewQuality}
                    swipeOptions={previewSwipeOptions}
                />
            )}
        </>
    );
};

export default MapOutputActions;
