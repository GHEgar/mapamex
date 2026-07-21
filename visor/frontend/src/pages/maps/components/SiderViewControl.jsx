import { useState, useEffect } from 'react';
import { useSider } from '@contexts/SiderContext';
import { useZenMode } from './ZenMode';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import { trackSiderLock } from '@services/analyticsService';

const MODES = [
    { key: 'auto', icon: 'mode_auto', label: 'Automático', tip: 'Automático — se expande al pasar el mouse' },
    { key: 'fijo', icon: 'mode_fijo', label: 'Fijo', tip: 'Fijo — siempre expandido' },
    { key: 'iconos', icon: 'mode_iconos', label: 'Solo iconos', tip: 'Solo iconos — siempre colapsado' },
    { key: 'zen', icon: 'mode_zen', label: 'Zen', tip: 'Zen — mapa limpio (clic en el logo para salir)' },
];

const WRAP = 'bg-white border-2 border-slate-200 rounded-full p-1';
const PILL = 'flex items-center justify-center h-8 rounded-full transition-colors';

const pillClass = (active) => `${PILL} ${active
    ? 'bg-primary text-white shadow-sm'
    : 'text-graphite hover:text-primary-deep hover:bg-slate-50'}`;

const SiderViewControl = ({ orientation = 'row' }) => {
    const { lockMode, setLockMode, setIsHovered } = useSider();
    const { userZenMode, setUserZenMode } = useZenMode();
    const [columnOpen, setColumnOpen] = useState(false);

    useEffect(() => {
        if (orientation === 'row') setColumnOpen(false);
    }, [orientation]);

    const activeKey = userZenMode
        ? 'zen'
        : lockMode === 'expanded' ? 'fijo' : lockMode === 'collapsed' ? 'iconos' : 'auto';

    const applyMode = (key) => {
        trackSiderLock(key);
        if (key === 'zen') {
            setUserZenMode(true);
            return;
        }
        setUserZenMode(false);
        if (key === 'fijo') {
            setLockMode('expanded');
            setIsHovered(true);
        } else if (key === 'iconos') {
            setLockMode('collapsed');
            setIsHovered(false);
        } else {
            setLockMode('auto');
        }
    };

    if (orientation === 'column') {
        const active = MODES.find(m => m.key === activeKey) || MODES[0];

        if (!columnOpen) {
            return (
                <Tooltip content={`Vista: ${active.label} · clic para cambiar`} placement="right" disableMobile triggerBlock>
                    <button
                        type="button"
                        onClick={() => setColumnOpen(true)}
                        aria-label={`Vista: ${active.label}. Clic para cambiar de modo`}
                        aria-expanded={false}
                        className="w-full flex items-center justify-center bg-white border-2 border-slate-200 rounded-full p-1.5 cursor-pointer"
                    >
                        <span className="size-7 flex items-center justify-center rounded-full bg-primary text-white shadow-sm">
                            <Icon name={active.icon} className="size-4" />
                        </span>
                    </button>
                </Tooltip>
            );
        }

        return (
            <div role="group" aria-label="Vista del panel" className={`w-full flex flex-col gap-1 ${WRAP}`}>
                {MODES.map(({ key, icon, tip }) => (
                    <Tooltip key={key} content={tip} placement="right" disableMobile triggerBlock triggerClassName="w-full">
                        <button
                            type="button"
                            onClick={() => { applyMode(key); setColumnOpen(false); }}
                            aria-pressed={activeKey === key}
                            aria-label={tip}
                            className={`w-full cursor-pointer ${pillClass(activeKey === key)}`}
                        >
                            <Icon name={icon} className="size-4.5" />
                        </button>
                    </Tooltip>
                ))}
            </div>
        );
    }

    return (
        <div role="group" aria-label="Vista del panel" className={`w-full flex gap-1 ${WRAP}`}>
            {MODES.map(({ key, icon, tip }) => (
                <Tooltip key={key} content={tip} placement="bottom" delay={200} disableMobile triggerClassName="flex-1">
                    <button
                        type="button"
                        onClick={() => applyMode(key)}
                        aria-pressed={activeKey === key}
                        aria-label={tip}
                        className={`w-full cursor-pointer ${pillClass(activeKey === key)}`}
                    >
                        <Icon name={icon} className="size-4.5" />
                    </button>
                </Tooltip>
            ))}
        </div>
    );
};

export default SiderViewControl;
