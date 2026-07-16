import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Overlay from 'ol/Overlay';

const TextInlineEditor = ({ mapRef, feature, onChange, onCommit, onCancel }) => {
    const elementRef = useRef(null);
    const inputRef = useRef(null);
    const [draft, setDraft] = useState('');

    if (!elementRef.current && typeof document !== 'undefined') {
        const el = document.createElement('div');
        el.style.pointerEvents = 'auto';
        elementRef.current = el;
    }

    useEffect(() => {
        if (!feature) return;
        setDraft(feature.get('textLabel') || '');
        const id = requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.select?.();
        });
        return () => cancelAnimationFrame(id);
    }, [feature]);

    useEffect(() => {
        const map = mapRef?.current;
        if (!map || !feature || !elementRef.current) return;

        const overlay = new Overlay({
            element: elementRef.current,
            positioning: 'center-center',
            stopEvent: true,
            insertFirst: false
        });
        const geom = feature.getGeometry();
        if (geom) overlay.setPosition(geom.getCoordinates());
        map.addOverlay(overlay);

        const sync = () => {
            const g = feature.getGeometry();
            if (g) overlay.setPosition(g.getCoordinates());
        };
        feature.on('change', sync);
        return () => {
            feature.un('change', sync);
            map.removeOverlay(overlay);
        };
    }, [mapRef, feature]);

    if (!feature || !elementRef.current) return null;

    const handleChange = (value) => {
        setDraft(value);
        onChange?.(value);
    };

    return createPortal(
        <input
            ref={inputRef}
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); onCommit?.(draft); }
                if (e.key === 'Escape') { e.preventDefault(); onCancel?.(); }
            }}
            onBlur={() => onCommit?.(draft)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Escribe…"
            aria-label="Texto de la anotación"
            className="min-w-20 max-w-[60vw] px-2 py-1 text-center rounded-2xl border-2 border-primary-deep bg-white/95 font-sans font-bold text-sm text-graphite shadow-lg outline-none"
        />,
        elementRef.current
    );
};

export default TextInlineEditor;
