import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';

const formatCount = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`.replace('.0k', 'k');
    return String(n);
};

const ActionsToolbar = ({
    onClear,
    onDownload,
    onCenter,
    moveHandleProps = null,
    isMoving = false,
    visible = true,
    downloadCount = null,
    downloadShowsPlus = false,
    downloadTooltip = 'Descargar información',
    centerTooltip = 'Centrar selección en el mapa',
    moveTooltip = 'Arrastrar para mover esta tarjeta',
}) => {
    if (!visible) return null;

    const hasAction = onClear || onDownload || onCenter || moveHandleProps;
    if (!hasAction) return null;

    return (
        <div className="flex flex-col gap-1.5">
            {onClear && (
                <Tooltip content="Cerrar todas las tarjetas" placement="left" delay={300}>
                    <button
                        type="button"
                        onClick={onClear}
                        className="bg-primary-soft text-primary-deep hover:border-primary flex items-center justify-center p-1 rounded-full border border-transparent transition-all shadow-lg"
                    >
                        <Icon name="cerrar" className="size-5" />
                    </button>
                </Tooltip>
            )}

            {moveHandleProps && (
                <Tooltip content={moveTooltip} placement="left" delay={300}>
                    <button
                        type="button"
                        {...moveHandleProps}
                        className={`flex items-center justify-center p-1 rounded-full border border-transparent transition-all bg-slate-100 text-primary-deep hover:border-primary shadow-lg ${isMoving ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{ touchAction: 'none' }}
                    >
                        <Icon name="move_arrows" className="size-5" />
                    </button>
                </Tooltip>
            )}

            {onDownload && (
                <Tooltip content={downloadTooltip} placement="left" delay={300}>
                    <button
                        type="button"
                        onClick={onDownload}
                        className="relative flex items-center justify-center p-1 rounded-full border border-transparent transition-all bg-slate-100 text-primary-deep hover:border-primary shadow-lg"
                    >
                        <Icon name="download" className="size-5" />
                        {downloadCount != null && downloadCount > 0 && (
                            <span className="absolute -bottom-1.5 -right-3 min-w-4.5 h-4.5 px-1 inline-flex items-center justify-center rounded-full bg-secondary text-white text-[10px]/[12px] font-bold tabular-nums shadow-sm">
                                {formatCount(downloadCount)}{downloadShowsPlus ? '+' : ''}
                            </span>
                        )}
                    </button>
                </Tooltip>
            )}

            {onCenter && (
                <Tooltip content={centerTooltip} placement="left" delay={300}>
                    <button
                        type="button"
                        onClick={onCenter}
                        className="flex items-center justify-center p-1 rounded-full border border-transparent transition-all bg-slate-100 text-primary-deep hover:border-primary shadow-lg"
                    >
                        <Icon name="center_group" className="size-5" />
                    </button>
                </Tooltip>
            )}
        </div>
    );
};

export default ActionsToolbar;
