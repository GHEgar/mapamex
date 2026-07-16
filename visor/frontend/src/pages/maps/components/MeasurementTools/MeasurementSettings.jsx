import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMapsContext } from '@hooks/useMaps';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import { BAR_SHELL, BAR_DIVIDER } from './StyleControls';

const LENGTH_UNITS = [
    { value: 'auto', label: 'Auto' },
    { value: 'm', label: 'm' },
    { value: 'km', label: 'km' }
];

const AREA_UNITS = [
    { value: 'auto', label: 'Auto' },
    { value: 'm2', label: 'm²' },
    { value: 'ha', label: 'ha' },
    { value: 'km2', label: 'km²' }
];

const btnBase = 'flex-1 px-2 py-1 text-[11px] font-sans font-medium rounded-2xl transition-colors border border-transparent cursor-pointer';

const SegmentedSelector = ({ value, options, onChange, label }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-sans text-graphite uppercase tracking-wide">{label}</span>
        <div className="flex gap-0.5 bg-slate-100 rounded-2xl p-0.5">
            {options.map(opt => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={[
                        btnBase,
                        value === opt.value
                            ? 'bg-white text-primary-deep shadow-lg'
                            : 'text-graphite hover:text-primary-deep'
                    ].join(' ')}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

const MeasurementSettings = ({ anchorRef, open, onClose }) => {
    const { measurementConfig, setMeasurementConfig } = useMapsContext();
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target) && anchorRef?.current && !anchorRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose, anchorRef]);

    if (!open) return null;

    const panel = (
        <div
            ref={panelRef}
            className={`${BAR_SHELL} flex-col items-stretch gap-2 min-w-45`}
        >
            <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xs text-graphite">Configuración</span>
                <button type="button" onClick={onClose} className="flex items-center justify-center size-5 rounded-full hover:bg-slate-100" aria-label="Cerrar configuración">
                    <Icon name="cerrarModal" className="size-4" />
                </button>
            </div>

            <div className={BAR_DIVIDER} style={{ width: '100%', height: 1, margin: 0 }} />

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={measurementConfig.showSegmentLengths}
                    onChange={(e) => setMeasurementConfig(prev => ({ ...prev, showSegmentLengths: e.target.checked }))}
                    className="size-3.5 accent-primary-deep cursor-pointer"
                />
                <span className="text-[11px] font-sans text-graphite">Longitud por segmento</span>
            </label>

            <div className={BAR_DIVIDER} style={{ width: '100%', height: 1, margin: 0 }} />

            <SegmentedSelector
                label="Distancia"
                value={measurementConfig.lengthUnit || 'auto'}
                options={LENGTH_UNITS}
                onChange={(unit) => setMeasurementConfig(prev => ({ ...prev, lengthUnit: unit }))}
            />

            <SegmentedSelector
                label="Área"
                value={measurementConfig.areaUnit || 'auto'}
                options={AREA_UNITS}
                onChange={(unit) => setMeasurementConfig(prev => ({ ...prev, areaUnit: unit }))}
            />
        </div>
    );

    return createPortal(panel, document.body);
};

const MeasurementSettingsButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <>
            <Tooltip content="Configuración de mediciones" delay={500}>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsOpen(prev => !prev)}
                    className="flex items-center justify-center size-7 rounded-full border border-transparent hover:border-primary-deep hover:bg-slate-50 transition-colors cursor-pointer"
                    aria-label="Configuración de mediciones"
                >
                    <Icon name="settings" state="normal" className="size-4 text-graphite" />
                </button>
            </Tooltip>
            <MeasurementSettings
                anchorRef={buttonRef}
                open={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};

export default MeasurementSettingsButton;
