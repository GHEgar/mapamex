export function resolveStorageUrl(url) {
    if (!url || typeof url !== 'string') return null;
    if (/^(https?:\/\/|data:|\/storage\/|\/api\/)/.test(url)) return url;
    return `/storage/${url.replace(/^\/+/, '')}`;
}
