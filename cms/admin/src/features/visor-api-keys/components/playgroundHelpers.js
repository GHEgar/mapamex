export function buildEmbedUrl({ baseUrl, key, share, layers }) {
    const params = new URLSearchParams();
    if (key) params.set('key', key);
    if (share) {
        params.set('s', share);
    } else if (layers) {
        params.set('layers', layers);
    }
    return `${(baseUrl || '').replace(/\/$/, '')}/embed?${params.toString()}`;
}

export function buildSnippet({ keyValue, share, layers, height, baseUrl }) {
    const baseAttr = baseUrl ? `\n    base-url="${baseUrl}"` : '';
    const contentAttr = share
        ? `\n    share="${share}"`
        : `\n    layers="${layers || ''}"`;
    return [
        `<script src="${(baseUrl || 'https://visor.mapamex.com').replace(/\/$/, '')}/widget/v1/visor.js" defer></script>`,
        ``,
        `<mapamex-visor`,
        `    api-key="${keyValue || 'mk_pub_…'}"${contentAttr}${baseAttr}`,
        `    height="${height || 500}">`,
        `</mapamex-visor>`,
    ].join('\n');
}

export function defaultBaseUrl() {
    return typeof window !== 'undefined' ? `${window.location.origin}/visor` : '';
}

export function matchesWildcard(pattern, origin) {
    if (!pattern || !origin) return false;
    const clean = pattern.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const originClean = origin.replace(/^https?:\/\//, '');
    if (clean === '*') return true;
    if (clean === originClean) return true;
    if (clean.startsWith('*.')) {
        const base = clean.slice(2);
        return originClean === base || originClean.endsWith('.' + base);
    }
    return false;
}
