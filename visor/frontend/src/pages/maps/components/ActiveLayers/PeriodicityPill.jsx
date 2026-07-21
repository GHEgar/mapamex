import Tooltip from '@components/Tooltip';
import { SLOT_PILL } from './datePillHelpers';

const PeriodicityPill = ({ label, tooltip, onClick }) => {
    const palette = SLOT_PILL.none;
    return (
        <Tooltip content={tooltip}>
            <button
                type="button"
                onClick={onClick}
                aria-label={tooltip}
                className={`flex items-center justify-center h-7 px-2 rounded-full border font-sans font-bold text-[10px] shrink-0 transition-all cursor-pointer ${palette.bg} ${palette.border} ${palette.text} ${palette.hover}`}
            >
                <span className="whitespace-nowrap">{label}</span>
            </button>
        </Tooltip>
    );
};

export default PeriodicityPill;
