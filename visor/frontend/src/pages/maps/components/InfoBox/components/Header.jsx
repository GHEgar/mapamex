import Icon from '@components/Icon';

const FeatureHeader = ({ value, onClose, index, total }) => {
    if (!value) return null;

    const showBadge = index != null && total != null && total > 1;

    return (
        <div className="relative w-full min-h-[61px] bg-slate-100 rounded-t-2xl px-12 py-2 mb-3 flex items-center">
            {showBadge && (
                <span className="absolute left-2 top-2 font-sans font-bold text-[10px]/[16px] text-primary tabular-nums whitespace-nowrap pointer-events-none">
                    {`${index}/${total}`}
                </span>
            )}

            <h3 className="w-full my-3 text-center font-sans font-bold text-xs text-numeralia tracking-normal break-words">
                {value}
            </h3>

            {onClose && (
                <span className="absolute right-2 top-2 flex">
                    <Icon
                        name="close"
                        className="size-5 text-[#8E8E8E] hover:text-graphite transition-colors cursor-pointer"
                        tooltip="Cerrar esta tarjeta"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    />
                </span>
            )}
        </div>
    );
};

export default FeatureHeader;
