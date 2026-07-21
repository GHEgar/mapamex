import Tooltip from '@components/Tooltip';
import { useMapsContext } from '@hooks/useMaps';
import { trackSwipeSlotChange } from '@services/analyticsService';

const NEXT_MEMBERSHIP = { A: 'AB', AB: 'B', B: 'A' };

const SlotBadge = ({ membership, onCycle, layerId }) => {
    const { setHighlightedSlots } = useMapsContext();
    const nextMembership = NEXT_MEMBERSHIP[membership];
    const tooltip = membership === 'AB'
        ? `Esta capa esta en los dos slots — click para mover solo a ${nextMembership}`
        : `Esta capa esta solo en el slot ${membership} — click para ${nextMembership === 'AB' ? 'agregar al otro' : `mover a ${nextMembership}`}`;

    const handleClick = (e) => {
        e.stopPropagation();
        trackSwipeSlotChange(layerId || null, membership, nextMembership);
        onCycle?.(nextMembership);
        setHighlightedSlots?.(nextMembership);
    };
    const handleMouseEnter = () => {
        setHighlightedSlots?.(membership);
    };
    const handleMouseLeave = () => {
        setHighlightedSlots?.(null);
    };

    const base = 'shrink-0 inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-sans font-extrabold leading-none cursor-pointer transition-colors';

    return (
        <Tooltip content={tooltip} key={membership}>
            <button
                type="button"
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label={tooltip}
                className={
                    membership === 'A' ? `${base} bg-primary text-white hover:bg-primary-deep`
                        : membership === 'B' ? `${base} bg-secondary text-white hover:opacity-90`
                            : `${base} bg-slate-100 border border-slate-200 hover:bg-slate-200`
                }
            >
                {membership === 'AB' ? (
                    <>
                        <span className="text-primary-deep">A</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-secondary">B</span>
                    </>
                ) : membership}
            </button>
        </Tooltip>
    );
};

export default SlotBadge;
