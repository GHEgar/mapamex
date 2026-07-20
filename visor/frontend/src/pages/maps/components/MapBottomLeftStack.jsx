import { useEffect, useRef, useState } from 'react';
import { useSiderAdaptivePosition } from '@contexts/SiderContext';
import { MAP_Z } from '@constants/mapLayers';
import MapControls from '@mapsComponents/MapControls';
import ScaleLineControl from '@mapsComponents/ScaleLineControl';

const STACK_INSET = 16;
const FALLBACK_HEIGHT = 200;

const MapBottomLeftStack = () => {
    const stackRef = useRef(null);
    const [stackHeight, setStackHeight] = useState(FALLBACK_HEIGHT);
    const { style, className } = useSiderAdaptivePosition({
        bottomOffset: stackHeight + STACK_INSET,
    });

    useEffect(() => {
        const node = stackRef.current;
        if (!node) return undefined;

        const measure = () => setStackHeight(node.offsetHeight || FALLBACK_HEIGHT);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={stackRef}
            className={`fixed bottom-4 ${MAP_Z.CONTROLS} flex flex-col items-start gap-6 ${className}`}
            style={style}
        >
            <MapControls />
            <ScaleLineControl />
        </div>
    );
};

export default MapBottomLeftStack;
