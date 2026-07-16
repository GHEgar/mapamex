import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import { Play, Pause } from 'lucide-react';

const PLAY_PALETTE = {
    A: 'bg-primary-soft border-primary text-primary hover:bg-primary/15',
    B: 'bg-secondary-soft border-secondary text-secondary hover:bg-secondary/20',
    default: 'bg-secondary-soft border-secondary text-secondary hover:bg-secondary/20',
};

const SECONDARY_PALETTE = {
    A: 'bg-primary-soft border-primary text-primary hover:bg-primary/15',
    B: 'bg-secondary-soft border-secondary text-secondary hover:bg-secondary/20',
    default: 'bg-primary-soft border-primary-deep text-primary-deep hover:bg-primary/15',
};

const BADGE_PALETTE = {
    A: 'bg-primary-soft border-primary text-primary',
    B: 'bg-secondary-soft border-secondary text-secondary',
    default: 'bg-primary-soft border-primary-deep text-primary-deep',
};

const DISABLED_CLASSES = 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed hover:bg-gray-100';

export const BackButton = ({ onClick }) => (
    <button onClick={onClick}>
        <Icon
            name="downArrow"
            tooltip="Regresar"
            classNameBG="bg-slate-50 size-7.5 rounded-full flex items-center justify-center p-2"
            className="size-4 transition-transform duration-300 rotate-90"
        />
    </button>
);

export const YearBadge = ({ year, slot }) => {
    const palette = BADGE_PALETTE[slot] || BADGE_PALETTE.default;
    return (
        <span className={`shrink-0 px-5 py-3 rounded-2xl text-sm leading-4 font-medium font-sans border ${palette}`}>
            {year}
        </span>
    );
};

export const PlayPauseButton = ({ isPlaying, onToggle, slot, disabled = false, disabledHint }) => {
    const IconGlyph = isPlaying ? Pause : Play;
    const label = isPlaying ? 'PAUSAR' : 'VER ANIMACIÓN';
    const palette = disabled ? DISABLED_CLASSES : (PLAY_PALETTE[slot] || PLAY_PALETTE.default);

    const button = (
        <button
            onClick={disabled ? undefined : onToggle}
            disabled={disabled}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-2xl border text-[8px]/[16px] font-bold font-sans transition-colors ${palette}`}
        >
            <IconGlyph className={`w-2.5 h-2.5 fill-current ${disabled ? 'opacity-50' : ''}`} />
            {label}
        </button>
    );

    return disabled && disabledHint ? <Tooltip content={disabledHint}>{button}</Tooltip> : button;
};

export const CarouselArrow = ({ direction, onClick }) => (
    <button onClick={onClick}>
        <Icon
            name="downArrow"
            tooltip={direction === 'left' ? 'Anterior' : 'Siguiente'}
            classNameBG="bg-slate-50 size-7.5 rounded-full flex items-center justify-center p-2"
            className={`size-4 transition-transform duration-300 ${direction === 'left' ? 'rotate-90' : '-rotate-90'}`}
        />
    </button>
);

const LOOP_INTERVAL_PRESETS = [250, 500, 1000, 2000, 3000];

const formatInterval = (ms) => {
    const s = ms / 1000;
    return `${s % 1 === 0 ? s : s.toFixed(2).replace(/\.?0+$/, '')}s`;
};

export const LoopIntervalButton = ({ value, onChange, slot, disabled = false }) => {
    const handleClick = () => {
        if (disabled) return;
        const idx = LOOP_INTERVAL_PRESETS.indexOf(value);
        const nextIdx = idx === -1 ? 0 : (idx + 1) % LOOP_INTERVAL_PRESETS.length;
        onChange(LOOP_INTERVAL_PRESETS[nextIdx]);
    };
    const palette = disabled ? DISABLED_CLASSES : (SECONDARY_PALETTE[slot] || SECONDARY_PALETTE.default);
    return (
        <Tooltip content="Cambiar velocidad del loop">
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`flex items-center justify-center h-7.5 px-2 rounded-2xl border text-[11px]/[16px] font-bold font-sans transition-colors tabular-nums min-w-11 ${palette}`}
            >
                {formatInterval(value)}
            </button>
        </Tooltip>
    );
};

export const LoopDirectionButton = ({ value, onChange, slot, disabled = false }) => {
    const isLtr = value !== 'rtl';
    const handleClick = () => !disabled && onChange(isLtr ? 'rtl' : 'ltr');
    const palette = disabled ? DISABLED_CLASSES : (SECONDARY_PALETTE[slot] || SECONDARY_PALETTE.default);
    return (
        <Tooltip content={isLtr ? 'Dirección: izquierda a derecha' : 'Dirección: derecha a izquierda'}>
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`flex items-center justify-center h-7.5 w-7.5 rounded-2xl border transition-colors ${palette}`}
            >
                <Icon
                    name="downArrow"
                    className={`size-4 transition-transform duration-300 ${isLtr ? '-rotate-90' : 'rotate-90'} ${disabled ? 'opacity-50' : ''}`}
                />
            </button>
        </Tooltip>
    );
};
