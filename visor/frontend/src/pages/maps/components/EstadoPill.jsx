import { useMemo, useRef, useState } from 'react';
import Icon from '@components/Icon';
import Panel from '@components/Panel';
import ScrollContainer from '@components/ScrollContainer';
import { useMapsContext } from '@hooks/useMaps';
import { MAP_Z } from '@constants/mapLayers';

const EstadoPill = () => {
    const { estadoMode, municipioMode, compareMode } = useMapsContext();
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef(null);

    const { activeEstado, estados, setEstado, recenter } = estadoMode || {};

    const activeItem = useMemo(() => (
        (estados || []).find(item => item.cveEnt === activeEstado) || null
    ), [estados, activeEstado]);

    if (!estadoMode || !Array.isArray(estados) || estados.length <= 1) return null;
    if (compareMode?.active) return null;

    const label = activeItem?.nombre || 'Estado';

    const handleSelect = (cve) => {
        if (cve !== activeEstado) {
            setEstado(cve);
        } else {
            recenter?.();
        }
        setIsOpen(false);
    };

    return (
        <>
            <div className={`fixed ${municipioMode?.active ? 'top-16' : 'top-4'} left-1/2 -translate-x-1/2 ${MAP_Z.CONTROLS} flex items-center`}>
                <button
                    ref={anchorRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-label={`Estado seleccionado: ${label}`}
                    className={[
                        'h-10 flex items-center gap-2 px-4 rounded-full bg-white shadow-lg border transition-all cursor-pointer',
                        isOpen ? 'border-primary' : 'border-slate-100 hover:border-primary',
                    ].join(' ')}
                >
                    <Icon name="estado" state={isOpen ? 'hover' : 'normal'} className="size-5 shrink-0" />
                    <span className="text-[13px]/[16px] font-sans font-bold text-primary tracking-normal whitespace-nowrap truncate max-w-60">
                        {label}
                    </span>
                    <Icon name="downArrow" className={`size-4 shrink-0 text-graphite transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
            <Panel
                open={isOpen}
                onClose={() => setIsOpen(false)}
                anchorRef={anchorRef}
                role="dialog"
                closeOnEscape={true}
                width="w-80"
                maxHeight="max-h-120"
                noPadding={true}
                hideHeader={true}
                className={`border-none ${MAP_Z.POPOVERS}`}
                shadow="shadow-lg"
                offset={10}
                placement="bottom-center"
                rounded="rounded-2xl"
                bg="bg-slate-50"
            >
                <div className="pt-3 pb-4 px-4 w-full">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="block text-[18px]/[24px] font-sans font-bold text-primary tracking-normal">
                            Estado
                        </h3>
                        <span className="text-[10px] font-sans text-gray-400 tracking-normal">Fuente: INEGI</span>
                    </div>
                    <div className="relative bg-white rounded-2xl p-2">
                        <ScrollContainer className="max-h-100">
                            <div role="radiogroup" aria-label="Estados">
                                <div className="space-y-0.5">
                                    {estados.map(item => {
                                        const checked = item.cveEnt === activeEstado;
                                        return (
                                            <button
                                                type="button"
                                                role="radio"
                                                aria-checked={checked}
                                                key={item.cveEnt}
                                                onClick={() => handleSelect(item.cveEnt)}
                                                className={[
                                                    'w-full flex items-center px-2 py-1.5 rounded-2xl transition group cursor-pointer',
                                                    checked ? 'bg-secondary/10' : 'hover:bg-secondary/10',
                                                ].join(' ')}
                                            >
                                                <span className={`text-[13px]/[19px] font-sans text-left tracking-normal flex-1 ${checked ? 'text-primary font-bold' : 'text-graphite group-hover:text-primary'}`}>
                                                    {item.nombre}
                                                </span>
                                                <span className="text-[10px] font-sans text-gray-400 tabular-nums">{item.cveEnt}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </ScrollContainer>
                    </div>
                </div>
            </Panel>
        </>
    );
};

export default EstadoPill;
