import Tooltip from '@components/Tooltip';
import { Minus, Plus } from 'lucide-react';

export const ACTION_BTN = 'size-7 flex items-center justify-center rounded-full border border-transparent transition-colors cursor-pointer';
export const PURPLE_HOVER = 'hover:border-primary-deep hover:bg-slate-50';
export const PINK_HOVER = 'hover:border-primary hover:bg-slate-50';
export const BAR_SHELL = 'flex items-center gap-1 px-2 py-2 bg-slate-50 rounded-2xl shadow-lg border border-slate-200';
export const BAR_DIVIDER = 'w-px h-5 bg-slate-200 mx-1';

const CHECKER = {
    backgroundImage: 'linear-gradient(45deg,#cbd2dd 25%,transparent 25%,transparent 75%,#cbd2dd 75%),linear-gradient(45deg,#cbd2dd 25%,#fff 25%,#fff 75%,#cbd2dd 75%)',
    backgroundSize: '6px 6px',
    backgroundPosition: '0 0,3px 3px'
};

export const ColorSwatch = ({ value, onChange, tooltip, ariaLabel, allowNone = false }) => {
    const isNone = allowNone && !value;
    return (
        <Tooltip content={tooltip} delay={500}>
            <label className={`${ACTION_BTN} ${PURPLE_HOVER} relative`} aria-label={ariaLabel}>
                <span
                    className="size-4 rounded-full border border-slate-200"
                    style={isNone ? CHECKER : { backgroundColor: value }}
                />
                <input
                    type="color"
                    value={value && !isNone ? value : '#ffffff'}
                    onChange={(e) => onChange?.(allowNone && e.target.value === '#ffffff' ? '' : e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label={ariaLabel}
                />
            </label>
        </Tooltip>
    );
};

export const Stepper = ({ onDown, onUp, downLabel, upLabel, tooltipDown, tooltipUp }) => (
    <>
        <Tooltip content={tooltipDown} delay={500}>
            <button type="button" onClick={onDown} className={`${ACTION_BTN} ${PURPLE_HOVER}`} aria-label={downLabel}>
                <Minus className="size-4 text-graphite" />
            </button>
        </Tooltip>
        <Tooltip content={tooltipUp} delay={500}>
            <button type="button" onClick={onUp} className={`${ACTION_BTN} ${PURPLE_HOVER}`} aria-label={upLabel}>
                <Plus className="size-4 text-graphite" />
            </button>
        </Tooltip>
    </>
);
