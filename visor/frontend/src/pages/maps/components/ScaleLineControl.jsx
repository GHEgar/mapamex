import { useCallback, useRef } from 'react';
import { useMapsContext } from '@hooks/useMaps';
import { useScaleLineControl } from '@hooksMaps/useScaleLineControl';

const ScaleLineControl = () => {
    const { mapRef, compareMode, paneMapInstances } = useMapsContext();
    const containerRef = useRef(null);
    const isSwipe = !!compareMode?.active;

    const getMapInstance = useCallback(() => {
        if (isSwipe) return paneMapInstances?.[0] ?? null;
        return mapRef?.current ?? null;
    }, [isSwipe, mapRef, paneMapInstances]);

    useScaleLineControl(getMapInstance, containerRef);

    return (
        <div ref={containerRef}>
            <style>{`
                .ol-scale-line,
                .ol-scale-bar {
                    position: relative;
                    bottom: auto;
                    left: auto;
                    background: transparent;
                    box-shadow: none;
                    padding: 0;
                    font-size: 10px;
                    line-height: 1;
                }

                .ol-scale-line-inner {
                    border: 1px solid rgb(39, 39, 42);
                    border-top: none;
                    color: rgb(39, 39, 42);
                    font-size: 10px;
                    text-align: center;
                    margin: 1px;
                    padding-bottom: 2px;
                    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
                    will-change: contents, width;
                }
            `}</style>
        </div>
    );
};

export default ScaleLineControl;
