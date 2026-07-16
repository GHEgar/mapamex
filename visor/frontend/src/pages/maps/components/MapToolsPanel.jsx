import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import Download from './MapExport/Download';
import MunicipioFilterButton from './MapExport/MunicipioFilterButton';
import ShareButton from './ShareButton';
import ShareActiveChip from './ShareActiveChip';
import Panel from '@components/Panel';
import FloatingIconButton from '@components/FloatingIconButton';
import Icon from '@components/Icon';
import ExportPreview from './MapExport/ExportPreview';
import { useShareDirtiness } from '@pages/maps/hooks/useShareDirtiness';
import { useMapsContext } from '@hooks/useMaps';
import { SIDER_EXPANDED_WIDTH } from '@constants/sider';

const COLLAPSE_KEY = 'visor.tools.collapsed';
const IS_NON_PROD = ['dev', 'beta'].includes(import.meta.env.VITE_APP_ENV);

const MapToolsPanel = () => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [isMunicipioOpen, setIsMunicipioOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const { municipioMode } = useMapsContext();
    const [previewFormat, setPreviewFormat] = useState('png');
    const [previewLegends, setPreviewLegends] = useState([]);
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewQuality, setPreviewQuality] = useState(null);
    const [previewSwipeOptions, setPreviewSwipeOptions] = useState(null);
    const { isDirty, loadedShareId, markPending } = useShareDirtiness();
    const inSyncWithShare = !!loadedShareId && !isDirty;
    const isModifiedFromShare = !!loadedShareId && isDirty;
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem(COLLAPSE_KEY, isCollapsed ? '1' : '0'); } catch { }
    }, [isCollapsed]);

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

    const isAnyPanelOpen = isDownloadOpen || isPreviewOpen || isMunicipioOpen || isShareOpen;
    const isDownloadExpanded = !IS_NON_PROD && !isCollapsed;
    const collapseIconName = isCollapsed ? 'left_arrow_fill' : 'right_arrow_fill';
    const collapseTooltip = isCollapsed ? 'Mostrar etiquetas' : 'Compactar barra';

    return (
        <>
            <div className={`fixed top-4 right-4 z-11 ${isAnyPanelOpen ? 'max-md:z-60' : 'max-md:z-21'} flex flex-row items-center`}>
                {inSyncWithShare && (
                    <ShareActiveChip loadedShareId={loadedShareId} onMarkPending={markPending} />
                )}
                {isModifiedFromShare && (
                    <div className="hidden md:flex items-center gap-1.5 mr-2">
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
                <div className="hidden md:flex shrink-0 -mr-5 mt-2.5 z-12 relative">
                    <FloatingIconButton
                        name={collapseIconName}
                        tooltip={collapseTooltip}
                        placement="left"
                        delay={300}
                        onClick={() => setIsCollapsed(prev => !prev)}
                    />
                </div>
                <Panel
                    variant="floating"
                    position="static"
                    width={isCollapsed || !IS_NON_PROD ? 'w-auto' : 'w-auto md:w-[373px]'}
                    flexDirection="flex-row items-center"
                    className="rounded-2xl shadow-lg"
                    contentClassName="gap-2 px-4 py-3"
                    bg="bg-white"
                >
                    <Download
                        onOpenPreview={handleOpenPreview}
                        onOpenChange={setIsDownloadOpen}
                        collapsed={isCollapsed}
                        expanded={isDownloadExpanded}
                    />
                    <MunicipioFilterButton 
                        municipioMode={municipioMode} 
                        onOpenChange={setIsMunicipioOpen} 
                        collapsed={isCollapsed} 
                    />
                    <ShareButton onOpenChange={setIsShareOpen} />
                </Panel>
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

export default MapToolsPanel;
