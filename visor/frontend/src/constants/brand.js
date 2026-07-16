export const BRAND = {
    PRIMARY: '#E11D74',
    PRIMARY_DEEP: '#BE185D',
    PRIMARY_SOFT: '#FCE7F0',
    SECONDARY: '#FB7185',
    SECONDARY_SOFT: '#FFE4E6',
    NUMERALIA: '#1E293B',
    GRAPHITE: '#64748B',
};

export const rgba = (hex, alpha) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
