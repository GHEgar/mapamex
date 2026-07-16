import { BRAND, rgba } from '@constants/brand';

export const DEFAULT_TEXT_FILL = '#111827';
export const DEFAULT_TEXT_BG = '';

export const DRAW_COLORS = {
    purpleDeep: BRAND.PRIMARY_DEEP,
    purple: BRAND.PRIMARY,
    graphite: BRAND.GRAPHITE,
    orange: BRAND.SECONDARY,
    pink: '#FDA4AF',
    numeralia: BRAND.NUMERALIA,
    white: '#ffffff'
};

export const DRAW_FILLS = {
    purpleDeep: rgba(BRAND.PRIMARY_DEEP, 0.2),
    orange: rgba(BRAND.SECONDARY, 0.2),
    numeralia: rgba(BRAND.NUMERALIA, 0.15),
    halo: rgba(BRAND.PRIMARY_DEEP, 0.18)
};

export const ANNOTATIONS_STORAGE_KEY = 'visor.annotations';
export const ANNOTATIONS_MAX_BYTES = 200_000;
