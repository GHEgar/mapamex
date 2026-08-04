import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { transformExtent } from 'ol/proj';
import { fetchEstadosList } from '@services/estadoService';
import { setSearchEstado } from '@services/searchConfig';
import { getFitPadding, ACTIVE_LAYERS_PANEL_WIDTH } from '@pages/maps/helpers/mapFit';
import { setActiveEstadoBounds, boundsFromExtent } from '@pages/maps/helpers/estadoBounds';

export const DEFAULT_ESTADO = '24';
export const JALISCO_ESTADO = '14';
export const ESTADO_CVE_REGEX = /^(0[1-9]|[12][0-9]|3[0-2])$/;

const FIT_DURATION = 500;
const FIT_RETRY_INTERVAL_MS = 100;
const FIT_RETRY_MAX_ATTEMPTS = 60;
const ESTADO_MIN_ZOOM = 5;

export const useEstadoMode = ({ mapRef, initialOrder, setActiveLayerIds, findLayerById, findAllAncestors, getAllChildLayerIds }) => {
    const [activeEstado, setActiveEstadoState] = useState(DEFAULT_ESTADO);
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(false);
    const pendingFitRef = useRef(null);
    const fitTimerRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetchEstadosList({ signal: controller.signal })
            .then(items => setEstados(items))
            .catch(err => {
                if (err?.name !== 'AbortError') {
                    console.debug('No se pudo cargar la lista de estados', err);
                }
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    const extentByEstado = useMemo(() => {
        const map = new Map();
        estados.forEach(item => {
            if (Array.isArray(item.extent) && item.extent.length === 4) {
                map.set(item.cveEnt, item.extent);
            }
        });
        return map;
    }, [estados]);

    const findRootTheme = useCallback((layerId) => {
        const ancestors = findAllAncestors(layerId);
        const root = ancestors.length > 0 ? ancestors[ancestors.length - 1] : findLayerById(layerId);
        return root?.nodeType === 'tema' ? root : null;
    }, [findAllAncestors, findLayerById]);

    const applyViewForEstado = useCallback((extent4326, cve, { skipFit = false } = {}) => {
        if (fitTimerRef.current) {
            clearInterval(fitTimerRef.current);
            fitTimerRef.current = null;
        }
        const applyOnce = () => {
            const map = mapRef?.current;
            if (!map) return false;
            const view = map.getView();
            view.setMinZoom(ESTADO_MIN_ZOOM);
            if (!skipFit) {
                try {
                    const extent = transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
                    const padding = getFitPadding({
                        mapSize: map.getSize(),
                        rightPanelWidth: ACTIVE_LAYERS_PANEL_WIDTH,
                    });
                    view.fit(extent, { duration: FIT_DURATION, padding });
                } catch (err) {
                    console.debug('No se pudo hacer fit al extent del estado', err);
                }
            }
            return true;
        };
        if (applyOnce()) return;
        let attempts = 0;
        fitTimerRef.current = setInterval(() => {
            attempts++;
            if (applyOnce() || attempts >= FIT_RETRY_MAX_ATTEMPTS) {
                clearInterval(fitTimerRef.current);
                fitTimerRef.current = null;
            }
        }, FIT_RETRY_INTERVAL_MS);
    }, [mapRef]);

    const applyEstadoView = useCallback((cve, { skipFit = false } = {}) => {
        const extent = extentByEstado.get(cve);
        if (!extent) {
            pendingFitRef.current = { cve, skipFit };
            return;
        }
        pendingFitRef.current = null;
        const bounds = boundsFromExtent(extent);
        if (bounds) setActiveEstadoBounds(bounds);
        applyViewForEstado(extent, cve, { skipFit });
    }, [extentByEstado, applyViewForEstado]);

    useEffect(() => {
        const pending = pendingFitRef.current;
        if (!pending || !extentByEstado.has(pending.cve)) return;
        applyEstadoView(pending.cve, { skipFit: pending.skipFit });
    }, [extentByEstado, applyEstadoView]);

    useEffect(() => {
        setSearchEstado(activeEstado);
    }, [activeEstado]);

    useEffect(() => {
        const extent = extentByEstado.get(activeEstado);
        if (!extent) return;
        const bounds = boundsFromExtent(extent);
        if (bounds) setActiveEstadoBounds(bounds);
    }, [extentByEstado, activeEstado]);

    const setEstado = useCallback((cve, { skipLayerPurge = false, skipFit = false } = {}) => {
        const next = String(cve || '');
        if (!ESTADO_CVE_REGEX.test(next)) return;
        setActiveEstadoState(next);
        if (!skipLayerPurge) {
            setActiveLayerIds(prev => {
                const kept = prev.filter(id => {
                    const theme = findRootTheme(id);
                    return !theme?.cveEnt || theme.cveEnt === next;
                });
                const additions = [];
                const push = (id) => {
                    if (!kept.includes(id) && !additions.includes(id)) additions.push(id);
                };
                (initialOrder || []).forEach(id => {
                    const theme = findRootTheme(id);
                    if (theme?.cveEnt !== next) return;
                    push(id);
                    getAllChildLayerIds(id).forEach(push);
                });
                return [...kept, ...additions];
            });
        }
        applyEstadoView(next, { skipFit });
    }, [setActiveLayerIds, findRootTheme, applyEstadoView, initialOrder, getAllChildLayerIds]);

    const recenter = useCallback(() => {
        applyEstadoView(activeEstado, { skipFit: false });
    }, [applyEstadoView, activeEstado]);

    useEffect(() => {
        if (estados.length === 0) return;
        if (estados.some(item => item.cveEnt === activeEstado)) return;
        pendingFitRef.current = null;
        const fallback = estados.some(item => item.cveEnt === DEFAULT_ESTADO)
            ? DEFAULT_ESTADO
            : estados[0].cveEnt;
        setEstado(fallback);
    }, [estados, activeEstado, setEstado]);

    useEffect(() => () => {
        if (fitTimerRef.current) clearInterval(fitTimerRef.current);
    }, []);

    return useMemo(() => ({
        activeEstado,
        estados,
        loading,
        setEstado,
        recenter,
        findRootTheme,
    }), [activeEstado, estados, loading, setEstado, recenter, findRootTheme]);
};
