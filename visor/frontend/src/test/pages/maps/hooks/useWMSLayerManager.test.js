import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const {
    mockHasWMSConfig,
    mockFindWMSConfig,
    mockFindLayerById,
    mockSetLayerLoading,
    mockFlag
} = vi.hoisted(() => ({
    mockHasWMSConfig: vi.fn(),
    mockFindWMSConfig: vi.fn(),
    mockFindLayerById: vi.fn(),
    mockSetLayerLoading: vi.fn(),
    mockFlag: { value: true }
}));

vi.mock('@pages/maps/helpers/wmsConfig', () => ({
    hasWMSConfig: (...args) => mockHasWMSConfig(...args),
    findWMSConfig: (...args) => mockFindWMSConfig(...args)
}));

vi.mock('@pages/maps/helpers/layers/index', () => ({
    layers: []
}));

vi.mock('@pages/maps/helpers/layers/utils/layerHelpers', () => ({
    findLayerById: (...args) => mockFindLayerById(...args)
}));

vi.mock('@pages/maps/hooks/useInitializeFromUrl', () => ({
    filtersInitializationComplete: mockFlag
}));

vi.mock('@hooks/useDebounce', () => ({
    useDebounce: (value) => value
}));

vi.mock('@hooks/useLayerLoading', () => ({
    useLayerLoading: () => ({ setLayerLoading: mockSetLayerLoading })
}));

vi.mock('@hooksMaps/useAlwaysOnTopPinning', () => ({
    ALWAYS_ON_TOP_LAYER_IDS: new Set(['limite_mapamex', 'limite_municipal', 'regiones', 'limite_inegi', 'limite_municipal_inegi']),
    PIN_Z_OFFSET: 9000,
    useAlwaysOnTopPinning: () => new Set()
}));

import { useWMSLayerManager } from '@hooksMaps/useWMSLayerManager';

const makeMockLayer = () => {
    const store = new Map();
    const params = {};
    const source = {
        updateParams: vi.fn((p) => Object.assign(params, p)),
        getParams: vi.fn(() => params),
        refresh: vi.fn()
    };
    return {
        get: vi.fn((key) => store.get(key)),
        set: vi.fn((key, value) => { store.set(key, value); }),
        getSource: vi.fn(() => source),
        getOpacity: vi.fn(() => 1),
        setOpacity: vi.fn(),
        getZIndex: vi.fn(() => 0),
        setZIndex: vi.fn(),
        getVisible: vi.fn(() => true),
        setVisible: vi.fn(),
        getMinZoom: vi.fn(() => 0),
        setMinZoom: vi.fn(),
        getMaxZoom: vi.fn(() => 28),
        setMaxZoom: vi.fn(),
        changed: vi.fn()
    };
};

const makeMapRef = () => ({
    current: {
        addLayer: vi.fn(),
        removeLayer: vi.fn(),
        render: vi.fn()
    }
});

const renderManager = (overrides = {}) => {
    const props = {
        mapRef: makeMapRef(),
        activeLayerIds: [],
        hiddenLayerIds: [],
        createWMSLayer: vi.fn(() => makeMockLayer()),
        getLayerOpacity: vi.fn(() => 1),
        layerOpacities: {},
        getFilter: vi.fn(() => null),
        combineCQLFilters: vi.fn((a, b) => a || b || null),
        ...overrides
    };
    const hook = renderHook((p) => useWMSLayerManager(p), { initialProps: props });
    return { ...hook, props };
};

beforeEach(() => {
    vi.clearAllMocks();
    mockFlag.value = true;
    mockHasWMSConfig.mockReturnValue(false);
    mockFindWMSConfig.mockReturnValue(null);
    mockFindLayerById.mockReturnValue(null);
});

describe('useWMSLayerManager - inicialización', () => {
    it('retorna wmsLayersRef con un Map vacío', () => {
        const { result } = renderManager();
        expect(result.current.wmsLayersRef.current).toBeInstanceOf(Map);
        expect(result.current.wmsLayersRef.current.size).toBe(0);
    });

    it('no llama a createWMSLayer si filtersInitializationComplete.value es false', () => {
        mockFlag.value = false;
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockReturnValue({ baseUrl: 'http://gs/wms', layerName: 'ws:capa' });

        const { props } = renderManager({ activeLayerIds: ['capa-a'] });
        expect(props.createWMSLayer).not.toHaveBeenCalled();
        expect(props.mapRef.current.addLayer).not.toHaveBeenCalled();
    });

    it('no hace nada si mapRef.current es null', () => {
        mockHasWMSConfig.mockReturnValue(true);
        const mapRef = { current: null };
        const { props } = renderManager({ activeLayerIds: ['capa-a'], mapRef });
        expect(props.createWMSLayer).not.toHaveBeenCalled();
    });
});

describe('useWMSLayerManager - creación de capas', () => {
    it('crea una capa OL por cada grupo (baseUrl|wmsGroup)', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockImplementation((id) => ({
            baseUrl: 'http://gs/wms',
            layerName: `ws:${id}`,
            styles: '',
            wmsGroup: 'grupo-1'
        }));

        const { props } = renderManager({ activeLayerIds: ['capa-a', 'capa-b'] });

        expect(props.createWMSLayer).toHaveBeenCalledTimes(1);
        expect(props.mapRef.current.addLayer).toHaveBeenCalledTimes(1);
    });

    it('crea capas separadas para grupos distintos', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockImplementation((id) => ({
            baseUrl: 'http://gs/wms',
            layerName: `ws:${id}`,
            styles: '',
            wmsGroup: id === 'capa-a' ? 'grupo-1' : 'grupo-2'
        }));

        const { props } = renderManager({ activeLayerIds: ['capa-a', 'capa-b'] });

        expect(props.createWMSLayer).toHaveBeenCalledTimes(2);
        expect(props.mapRef.current.addLayer).toHaveBeenCalledTimes(2);
    });

    it('excluye capas hidden del conjunto WMS', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockImplementation((id) => ({
            baseUrl: 'http://gs/wms',
            layerName: `ws:${id}`,
            styles: '',
            wmsGroup: 'grupo-1'
        }));

        const { props } = renderManager({
            activeLayerIds: ['capa-a'],
            hiddenLayerIds: ['capa-a']
        });

        expect(props.createWMSLayer).not.toHaveBeenCalled();
    });

    it('ignora capas sin WMS config', () => {
        mockHasWMSConfig.mockImplementation((id) => id === 'capa-wms');
        mockFindWMSConfig.mockImplementation((id) => id === 'capa-wms' ? ({
            baseUrl: 'http://gs/wms',
            layerName: 'ws:capa-wms',
            styles: '',
            wmsGroup: 'g'
        }) : null);

        const { props } = renderManager({ activeLayerIds: ['capa-sin-wms', 'capa-wms'] });

        expect(props.createWMSLayer).toHaveBeenCalledTimes(1);
    });
});

describe('useWMSLayerManager - CQL_FILTER', () => {
    it('envía CQL_FILTER cuando getFilter retorna un valor', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockReturnValue({
            baseUrl: 'http://gs/wms',
            layerName: 'ws:capa-a',
            styles: '',
            wmsGroup: 'g'
        });
        const getFilter = vi.fn((id) => id === 'capa-a' ? "fecha='2024-01-01'" : null);

        const { props } = renderManager({ activeLayerIds: ['capa-a'], getFilter });

        const customParams = props.createWMSLayer.mock.calls[0][3];
        expect(customParams.CQL_FILTER).toBe("(fecha='2024-01-01')");
    });

    it('omite CQL_FILTER cuando todas las capas son INCLUDE', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockReturnValue({
            baseUrl: 'http://gs/wms',
            layerName: 'ws:capa-a',
            styles: '',
            wmsGroup: 'g'
        });

        const { props } = renderManager({ activeLayerIds: ['capa-a'] });

        const customParams = props.createWMSLayer.mock.calls[0][3];
        expect(customParams.CQL_FILTER).toBeUndefined();
    });
});

describe('useWMSLayerManager - ENV param', () => {
    it('no envía ENV en los parámetros WMS', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockReturnValue({
            baseUrl: 'http://gs/wms',
            layerName: 'ws:capa-a',
            styles: '',
            wmsGroup: 'g'
        });

        const { props } = renderManager({ activeLayerIds: ['capa-a'] });

        const customParams = props.createWMSLayer.mock.calls[0][3];
        expect(customParams.ENV).toBeUndefined();
    });
});

describe('useWMSLayerManager - capas tiled', () => {
    it('una capa tiled sin cqlFilter no se fusiona con otras del mismo grupo', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockImplementation((id) => ({
            baseUrl: 'http://gs/wms',
            layerName: `ws:${id}`,
            styles: '',
            wmsGroup: 'g',
            tiled: id === 'capa-tiled'
        }));

        const { props } = renderManager({ activeLayerIds: ['capa-tiled', 'capa-b'] });

        expect(props.createWMSLayer).toHaveBeenCalledTimes(2);
        const layersParams = props.createWMSLayer.mock.calls.map(call => call[3].LAYERS).sort();
        expect(layersParams).toEqual(['ws:capa-b', 'ws:capa-tiled']);
    });

    it('las capas tiled con cqlFilter (cultivos) se siguen fusionando en un solo pipeline', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockImplementation((id) => ({
            baseUrl: 'http://gs/wms',
            layerName: 'ws:cultivos',
            styles: '',
            wmsGroup: 'g',
            tiled: true,
            cqlFilter: `prediccion = '${id}'`
        }));

        const { props } = renderManager({ activeLayerIds: ['aguacate', 'agave'] });

        expect(props.createWMSLayer).toHaveBeenCalledTimes(1);
        const customParams = props.createWMSLayer.mock.calls[0][3];
        expect(customParams.LAYERS).toBe('ws:cultivos');
        expect(customParams.CQL_FILTER).toContain('OR');
    });

    it('las capas no tiled del mismo grupo se siguen fusionando', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockImplementation((id) => ({
            baseUrl: 'http://gs/wms',
            layerName: `ws:${id}`,
            styles: '',
            wmsGroup: 'g',
            tiled: false
        }));

        const { props } = renderManager({ activeLayerIds: ['capa-a', 'capa-b'] });

        expect(props.createWMSLayer).toHaveBeenCalledTimes(1);
        const customParams = props.createWMSLayer.mock.calls[0][3];
        expect(customParams.LAYERS.split(',').sort()).toEqual(['ws:capa-a', 'ws:capa-b']);
    });
});

describe('useWMSLayerManager - pin layers', () => {
    beforeEach(() => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockImplementation((id) => ({
            baseUrl: 'http://gs/wms',
            layerName: `ws:${id}`,
            styles: '',
            wmsGroup: id
        }));
    });

    it('usa z-index normal cuando pinnedLayerIds está vacío', () => {
        const { props } = renderManager({ activeLayerIds: ['limite_municipal'] });
        const zIndex = props.createWMSLayer.mock.calls[0][2];
        expect(zIndex).toBeLessThan(9000);
    });

    it('aplica PIN_Z_OFFSET cuando la capa está en pinnedLayerIds', () => {
        const { props } = renderManager({
            activeLayerIds: ['limite_municipal'],
            pinnedLayerIds: new Set(['limite_municipal']),
            initialOrder: ['limite_municipal']
        });
        const zIndex = props.createWMSLayer.mock.calls[0][2];
        expect(zIndex).toBeGreaterThanOrEqual(9000);
    });

    it('no aplica pin a capas NO presentes en pinnedLayerIds', () => {
        const { props } = renderManager({
            activeLayerIds: ['capa-a'],
            pinnedLayerIds: new Set(['limite_municipal']),
            initialOrder: ['limite_municipal']
        });
        const zIndex = props.createWMSLayer.mock.calls[0][2];
        expect(zIndex).toBeLessThan(9000);
    });

    it('respeta initialOrder entre múltiples pin-eadas', () => {
        const { props } = renderManager({
            activeLayerIds: ['limite_mapamex', 'limite_municipal'],
            pinnedLayerIds: new Set(['limite_mapamex', 'limite_municipal']),
            initialOrder: ['limite_mapamex', 'limite_municipal']
        });
        const callsByRepId = Object.fromEntries(
            props.createWMSLayer.mock.calls.map(c => [c[0], c[2]])
        );
        expect(callsByRepId['limite_mapamex']).toBeGreaterThan(callsByRepId['limite_municipal']);
        expect(callsByRepId['limite_mapamex']).toBeGreaterThanOrEqual(9000);
        expect(callsByRepId['limite_municipal']).toBeGreaterThanOrEqual(9000);
    });
});

describe('useWMSLayerManager - cleanup', () => {
    it('elimina todas las capas del mapa al desmontar', () => {
        mockHasWMSConfig.mockReturnValue(true);
        mockFindWMSConfig.mockReturnValue({
            baseUrl: 'http://gs/wms',
            layerName: 'ws:capa-a',
            styles: '',
            wmsGroup: 'g'
        });

        const { props, unmount, result } = renderManager({ activeLayerIds: ['capa-a'] });
        expect(result.current.wmsLayersRef.current.size).toBe(1);

        unmount();

        expect(props.mapRef.current.removeLayer).toHaveBeenCalledTimes(1);
    });
});
