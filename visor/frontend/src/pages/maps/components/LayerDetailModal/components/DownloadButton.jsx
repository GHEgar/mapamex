import Icon from '@components/Icon';
import Loading from '@components/Loading';
import Tooltip from '@components/Tooltip';
import LicenseTooltipContent from '@components/LicenseTooltipContent';
import { formatBytes } from '../../../hooks/useLayerDownload';

const licenciaContent = <LicenseTooltipContent />;

const DownloadButton = ({
    downloading,
    progress,
    disabled,
    onDownload,
    onCancel,
    onMenuToggle,
    menuAnchorRef,
    isMobile,
}) => {
    if (downloading) {
        return (
            <Tooltip content="Toca para cancelar" variant="warning" placement="top" forceVisible={isMobile}>
                <button
                    onClick={onCancel}
                    className="relative flex items-center justify-center gap-2 md:w-[220px] px-5 md:px-6 text-[14px]/[47px] text-white rounded-2xl transition-colors h-12.5 font-bold font-sans bg-secondary hover:bg-rose-500 hover:shadow-lg overflow-hidden"
                >
                    <Loading
                        visible
                        size="size-25 md:size-50"
                        border="border-1 md:border-3"
                        color="border-current"
                        className="absolute inset-1 !animate-[spin_3s_cubic-bezier(0.68,-0.55,0.27,1.55)_infinite]"
                    />
                    <span className="relative z-10 tabular-nums">
                        {isMobile
                            ? (progress ? formatBytes(progress.loaded) : 'Cancelar')
                            : <>Cancelar{progress && <> <span className="opacity-60">│</span> {formatBytes(progress.loaded)}</>}</>
                        }
                    </span>
                </button>
            </Tooltip>
        );
    }

    if (isMobile) {
        return (
            <Tooltip content={licenciaContent} placement="top" delay={300} interactive>
                <button
                    ref={menuAnchorRef}
                    onClick={onMenuToggle}
                    disabled={disabled}
                    className="flex items-center justify-center h-12.5 px-5 text-white rounded-2xl transition-colors font-bold font-sans disabled:opacity-60 disabled:cursor-not-allowed bg-primary-deep hover:bg-primary hover:shadow-lg"
                >
                    <Icon name="download" />
                </button>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={licenciaContent} placement="top" delay={300}>
            <div ref={menuAnchorRef} className="relative flex items-center">
                <button
                    onClick={onDownload}
                    disabled={disabled}
                    className="w-full md:w-[220px] px-10 text-[14px]/[47px] text-white text-center rounded-2xl transition-colors h-12.5 font-bold font-sans disabled:opacity-60 disabled:cursor-not-allowed bg-primary-deep hover:bg-primary hover:shadow-lg"
                >
                    Descargar capa
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
                    disabled={disabled}
                    className="absolute right-0 top-0 flex items-center justify-center w-10 h-full rounded-r-2xl transition-colors text-white hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Icon name="opciones" state="normal" className="size-4.5 text-white" />
                </button>
            </div>
        </Tooltip>
    );
};

export default DownloadButton;
