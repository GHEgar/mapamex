import { useCallback, useEffect, useState } from 'react';
import { listBasemaps } from '@features/visor-basemaps/api/basemapsService';


export function useBasemaps() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await listBasemaps());
        } catch (err) {
            setError(err?.response?.data?.detail || err?.message || 'Error al cargar mapas base');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { reload(); }, [reload]);

    return { items, loading, error, reload };
}
