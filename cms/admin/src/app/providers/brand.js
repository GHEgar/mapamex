export const BRAND = {
    primary: '#E11D74',
    primaryDeep: '#BE185D',
    primarySoft: '#FCE7F0',
    secondary: '#FB7185',
    secondarySoft: '#FFE4E6',
    numeralia: '#1E293B',
    graphite: '#64748B',
};

export const rgba = (hex, alpha) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
