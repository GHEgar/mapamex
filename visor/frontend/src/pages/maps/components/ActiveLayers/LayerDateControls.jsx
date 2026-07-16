import { useMemo } from 'react';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import DatePill from './DatePill';
import SlotBadge from './SlotBadge';
import { computeLabel } from './datePillHelpers';
import { Play, Pause } from 'lucide-react';

const LOOP_PALETTE = {
    A: { primary: 'bg-primary-soft border-primary hover:bg-primary/15', secondary: 'bg-primary-soft border-primary text-primary hover:bg-primary/15', icon: 'text-primary' },
    B: { primary: 'bg-secondary-soft border-secondary hover:bg-secondary/20', secondary: 'bg-secondary-soft border-secondary text-secondary hover:bg-secondary/20', icon: 'text-secondary' },
    none: { primary: 'bg-secondary-soft border-secondary hover:bg-secondary/20', secondary: 'bg-primary-soft border-primary-deep text-primary-deep hover:bg-primary/15', icon: 'text-primary-deep' },
};

const DISABLED_PRIMARY = 'bg-gray-100 border-gray-300';
const DISABLED_SECONDARY = 'bg-gray-100 border-gray-300 text-gray-400';
const DISABLED_ICON = 'text-gray-400';

const LOOP_BUTTON_BASE = 'flex items-center justify-center size-6 rounded-full border transition-colors shrink-0 disabled:cursor-not-allowed';

const LoopControls = ({
    isLooping,
    canPlayLoop,
    loopIntervalMs,
    loopDirection,
    onPlay,
    onInterval,
    onDirection,
    slotPalette = 'none',
    mirror = false,
    disabled = false,
    disabledHint = ''
}) => {
    const palette = LOOP_PALETTE[slotPalette] || LOOP_PALETTE.none;
    const slotLabel = slotPalette === 'A' || slotPalette === 'B' ? ` (lado ${slotPalette})` : '';
    const primaryClasses = disabled ? DISABLED_PRIMARY : palette.primary;
    const secondaryClasses = disabled ? DISABLED_SECONDARY : palette.secondary;
    const iconColor = disabled ? DISABLED_ICON : palette.icon;
    const playTooltip = disabled ? disabledHint : (isLooping ? 'Pausar animación' : 'Iniciar animación') + slotLabel;
    const intervalTooltip = disabled ? disabledHint : 'Cambiar velocidad' + slotLabel;
    const directionTooltip = disabled ? disabledHint : (loopDirection === 'rtl' ? 'Dirección: derecha a izquierda' : 'Dirección: izquierda a derecha') + slotLabel;

    const playButton = (
        <Tooltip content={playTooltip} key="play">
            <button
                onClick={onPlay}
                disabled={disabled || !canPlayLoop}
                className={`group/play ${LOOP_BUTTON_BASE} disabled:opacity-50 ${primaryClasses}`}
            >
                {isLooping ? (
                    <Pause className={`size-2.5 fill-current ${iconColor}`} />
                ) : (
                    <Play className={`size-2.5 fill-current ${iconColor}`} />
                )}
            </button>
        </Tooltip>
    );

    const intervalButton = (
        <Tooltip content={intervalTooltip} key="interval">
            <button
                onClick={onInterval}
                disabled={disabled}
                className={`${LOOP_BUTTON_BASE} text-[9px] font-sans font-bold tabular-nums ${secondaryClasses}`}
            >
                {(loopIntervalMs / 1000).toString().replace(/^0(?=\.)/, '').replace(/\.?0+$/, '') || '0'}s
            </button>
        </Tooltip>
    );

    const directionButton = (
        <Tooltip content={directionTooltip} key="direction">
            <button
                onClick={onDirection}
                disabled={disabled}
                className={`${LOOP_BUTTON_BASE} ${secondaryClasses}`}
            >
                <Icon name="downArrow" className={`size-3 transition-transform duration-300 ${iconColor} ${loopDirection === 'rtl' ? 'rotate-90' : '-rotate-90'}`} />
            </button>
        </Tooltip>
    );

    if (!canPlayLoop && !isLooping) return null;
    const ordered = mirror ? [directionButton, intervalButton, playButton] : [playButton, intervalButton, directionButton];
    return <>{ordered}</>;
};

const LayerDateControls = ({
    layerId,
    rasterPeriodicity,
    compareMode,
    slotMembership,
    liveDateFilter,
    isLooping,
    isLoading,
    canPlayLoop,
    loopIntervalMs,
    loopDirection,
    onPillClick,
    onPlay,
    onInterval,
    onDirection,
    onCycleSlot
}) => {
    const isSwipe = !!compareMode?.active;

    const liveLabel = useMemo(() => computeLabel(liveDateFilter, rasterPeriodicity), [liveDateFilter, rasterPeriodicity]);
    const slotALabel = useMemo(() => computeLabel(compareMode?.paneA?.filters?.[layerId]?.date, rasterPeriodicity), [compareMode?.paneA?.filters, layerId, rasterPeriodicity]);
    const slotBLabel = useMemo(() => computeLabel(compareMode?.paneB?.filters?.[layerId]?.date, rasterPeriodicity), [compareMode?.paneB?.filters, layerId, rasterPeriodicity]);

    const hasAnyLabel = !!(liveLabel.label || slotALabel.label || slotBLabel.label);
    if (!hasAnyLabel) return null;

    if (!isSwipe) {
        if (!liveLabel.label) return null;
        return (
            <div className="flex items-center gap-1 w-full">
                <DatePill slot="none" label={liveLabel.label} kind={liveLabel.kind} onClick={onPillClick} isLoopingPulse={isLooping && isLoading} size="lg" />
                <LoopControls
                    isLooping={isLooping}
                    canPlayLoop={canPlayLoop}
                    loopIntervalMs={loopIntervalMs}
                    loopDirection={loopDirection}
                    onPlay={onPlay}
                    onInterval={onInterval}
                    onDirection={onDirection}
                    slotPalette="none"
                />
            </div>
        );
    }

    if (!slotMembership) return null;

    const isActiveA = compareMode.activeSlot === 'A';
    const inactiveHint = `Cambia al lado ${isActiveA ? 'B' : 'A'} para controlar este loop`;
    const showA = (slotMembership === 'A' || slotMembership === 'AB') && slotALabel.label;
    const showB = (slotMembership === 'B' || slotMembership === 'AB') && slotBLabel.label;

    if (slotMembership === 'AB') {
        const hasLoopControls = canPlayLoop || isLooping;

        if (!hasLoopControls) {
            return (
                <div className="flex items-center gap-1 w-full">
                    {showA && <DatePill slot="A" label={slotALabel.label} kind={slotALabel.kind} onClick={onPillClick} size="lg" />}
                    <div className="flex-1" />
                    <SlotBadge membership="AB" onCycle={onCycleSlot} layerId={layerId} />
                    <div className="flex-1" />
                    {showB && <DatePill slot="B" label={slotBLabel.label} kind={slotBLabel.kind} onClick={onPillClick} size="lg" />}
                </div>
            );
        }

        if (isActiveA) {
            return (
                <div className="flex items-center gap-1 w-full">
                    {showA && <DatePill slot="A" label={slotALabel.label} kind={slotALabel.kind} onClick={onPillClick} isLoopingPulse={isLooping && isLoading} size="lg" />}
                    <LoopControls
                        isLooping={isLooping}
                        canPlayLoop={canPlayLoop}
                        loopIntervalMs={loopIntervalMs}
                        loopDirection={loopDirection}
                        onPlay={onPlay}
                        onInterval={onInterval}
                        onDirection={onDirection}
                        slotPalette="A"
                    />
                    <div className="flex-1" />
                    <SlotBadge membership="AB" onCycle={onCycleSlot} layerId={layerId} />
                    {showB && <DatePill slot="B" label={slotBLabel.label} kind={slotBLabel.kind} onClick={onPillClick} size="lg" />}
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 w-full">
                {showA && <DatePill slot="A" label={slotALabel.label} kind={slotALabel.kind} onClick={onPillClick} size="lg" />}
                <SlotBadge membership="AB" onCycle={onCycleSlot} layerId={layerId} />
                <div className="flex-1" />
                <LoopControls
                    isLooping={isLooping}
                    canPlayLoop={canPlayLoop}
                    loopIntervalMs={loopIntervalMs}
                    loopDirection={loopDirection}
                    onPlay={onPlay}
                    onInterval={onInterval}
                    onDirection={onDirection}
                    slotPalette="B"
                    mirror
                />
                {showB && <DatePill slot="B" label={slotBLabel.label} kind={slotBLabel.kind} onClick={onPillClick} isLoopingPulse={isLooping && isLoading} size="lg" />}
            </div>
        );
    }

    if (slotMembership === 'A') {
        return (
            <div className="flex items-center gap-1 w-full">
                {showA && <DatePill slot="A" label={slotALabel.label} kind={slotALabel.kind} onClick={onPillClick} isLoopingPulse={isActiveA && isLooping && isLoading} size="lg" />}
                <LoopControls
                    isLooping={isActiveA && isLooping}
                    canPlayLoop={canPlayLoop}
                    loopIntervalMs={loopIntervalMs}
                    loopDirection={loopDirection}
                    onPlay={onPlay}
                    onInterval={onInterval}
                    onDirection={onDirection}
                    slotPalette="A"
                    disabled={!isActiveA}
                    disabledHint={inactiveHint}
                />
                <div className="flex-1" />
                <SlotBadge membership="A" onCycle={onCycleSlot} layerId={layerId} />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 w-full">
            <SlotBadge membership="B" onCycle={onCycleSlot} layerId={layerId} />
            <div className="flex-1" />
            <LoopControls
                isLooping={!isActiveA && isLooping}
                canPlayLoop={canPlayLoop}
                loopIntervalMs={loopIntervalMs}
                loopDirection={loopDirection}
                onPlay={onPlay}
                onInterval={onInterval}
                onDirection={onDirection}
                slotPalette="B"
                mirror
                disabled={isActiveA}
                disabledHint={inactiveHint}
            />
            {showB && <DatePill slot="B" label={slotBLabel.label} kind={slotBLabel.kind} onClick={onPillClick} isLoopingPulse={!isActiveA && isLooping && isLoading} size="lg" />}
        </div>
    );
};

export default LayerDateControls;
