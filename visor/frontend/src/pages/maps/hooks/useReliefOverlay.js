import { useEffect } from 'react';

export const useReliefOverlay = (reliefOverlayRef, baseMapId) => {
    useEffect(() => {
        const layer = reliefOverlayRef?.current;
        if (!layer) return;

        layer.setVisible(baseMapId !== 'sin_visor');
    }, [reliefOverlayRef, baseMapId]);
};
