import Tooltip from '@components/Tooltip';
import { rgba } from '@constants/brand';

const TRACK_TINT_ALPHA = 0.14;

const Switch = ({ checked, indeterminate, onChange, disabled, className = '', onLabel, offLabel, onColor, offColor, tooltip }) => {
    const hasLabels = onLabel || offLabel;
    const activeColor = !disabled && (checked ? onColor : offColor);

    const getTranslateClass = () => {
        if (indeterminate) return 'translate-x-[9px]';
        return checked ? 'translate-x-[18px]' : 'translate-x-0';
    };

    const getTrackClass = () => {
        if (disabled) return 'bg-slate-100';
        if (indeterminate) return 'bg-secondary-soft';
        return checked ? 'bg-primary-soft' : 'bg-slate-200';
    };

    const getKnobClass = () => {
        if (disabled) return 'bg-slate-300';
        if (indeterminate) return 'bg-secondary';
        return checked ? 'bg-primary' : 'bg-slate-400';
    };

    const renderButtonWithLabels = (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled && onChange) onChange(!checked);
            }}
            className={`
                inline-flex h-6 shrink-0 items-center rounded-full gap-0
                transition duration-200 ease-in-out
                ${activeColor ? '' : 'bg-slate-100'}
                ${checked ? 'flex-row-reverse pl-1.5 pr-1' : 'flex-row pl-1 pr-1.5'}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}
                ${className}
            `}
            style={activeColor ? { backgroundColor: rgba(activeColor, TRACK_TINT_ALPHA) } : undefined}
        >
            <span
                className={`size-4.5 rounded-full shrink-0 transition duration-200 ease-in-out ${activeColor ? '' : (disabled ? 'bg-slate-300' : 'bg-slate-400')}`}
                style={activeColor ? { backgroundColor: activeColor } : undefined}
            />
            <span
                className={`text-[9px] font-sans font-bold select-none px-1.5 ${activeColor ? '' : 'text-graphite'}`}
                style={activeColor ? { color: activeColor } : undefined}
            >
                {checked ? onLabel : offLabel}
            </span>
        </button>
    );

    if (hasLabels) {
        return tooltip ? <Tooltip content={tooltip}>{renderButtonWithLabels}</Tooltip> : renderButtonWithLabels;
    }

    const renderButton = (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled && onChange) {
                    onChange(!checked);
                }
            }}
            className={`
                relative inline-flex h-5 w-8.5 shrink-0 items-center rounded-full
                transition duration-200 ease-in-out
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}
                ${className}
            `}
        >
            <span
                className={`
                    absolute inset-x-0 top-1/2 h-1.25 -translate-y-1/2 rounded-full
                    transition duration-200 ease-in-out ${getTrackClass()}
                `}
            />
            <span
                className={`
                    relative inline-block size-4 rounded-full
                    transition duration-200 ease-in-out
                    ${getTranslateClass()} ${getKnobClass()}
                `}
            />
        </button>
    );

    return tooltip ? <Tooltip content={tooltip}>{renderButton}</Tooltip> : renderButton;
};

export default Switch;
