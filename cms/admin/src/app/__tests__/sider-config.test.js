import { describe, it, expect, vi } from 'vitest';
import { buildSiderItems, selectedKeyForPath } from '@app/sider-config';

const noop = () => {};

describe('buildSiderItems', () => {
    it('devuelve [] cuando no hay user', () => {
        expect(buildSiderItems({ user: null, onNavigate: noop })).toEqual([]);
        expect(buildSiderItems({ user: undefined, onNavigate: noop })).toEqual([]);
    });

    it('admin (tetlamamakani) ve Inicio + grupo Administrador + grupo de proyecto visor', () => {
        const items = buildSiderItems({
            user: { role: 'tetlamamakani', projects: [] },
            onNavigate: noop,
        });
        expect(items[0].key).toBe('/inicio');
        expect(items[1].key).toBe('platform');
        expect(items[1].type).toBe('group');
        expect(items[1].label).toBe('Administrador');
        expect(items[1].children).toHaveLength(4);

        const visor = items.find((i) => i.key === 'project-visor');
        expect(visor).toBeDefined();
        expect(visor.type).toBe('group');
    });

    it('admin ve Administrador con /users, /storage, /revision, /actividad', () => {
        const items = buildSiderItems({
            user: { role: 'tetlamamakani', projects: [] },
            onNavigate: noop,
        });
        expect(items.find((i) => i.key === 'platform').children.map((c) => c.key)).toEqual([
            '/users',
            '/storage',
            '/revision',
            '/actividad',
        ]);
    });

    it('editora ve TODOS los platform items pero los exclusivos de admin estan disabled', () => {
        const items = buildSiderItems({
            user: {
                role: 'editora',
                projects: [{ slug: 'visor', name: 'Visor', project_role: 'editor' }],
            },
            onNavigate: noop,
        });
        const platform = items.find((i) => i.key === 'platform');
        const platformByKey = Object.fromEntries(platform.children.map((c) => [c.key, c]));

        expect(Object.keys(platformByKey)).toEqual(['/users', '/storage', '/revision', '/actividad']);
        expect(platformByKey['/storage'].disabled).toBeFalsy();
        expect(platformByKey['/users'].disabled).toBe(true);
        expect(platformByKey['/revision'].disabled).toBe(true);
        expect(platformByKey['/actividad'].disabled).toBe(true);
    });

    it('editora sin memberships ve Inicio + Administrador (Storage accesible, resto con candado)', () => {
        const items = buildSiderItems({
            user: { role: 'editora', projects: [] },
            onNavigate: noop,
        });
        expect(items[0].key).toBe('/inicio');
        expect(items[1].key).toBe('platform');
        const accesibles = items[1].children.filter((c) => !c.disabled).map((c) => c.key);
        expect(accesibles).toEqual(['/storage']);
    });

    it('editora con membership en visor accede sin candado', () => {
        const items = buildSiderItems({
            user: {
                role: 'editora',
                projects: [
                    { slug: 'visor', name: 'Visor', project_role: 'viewer' },
                ],
            },
            onNavigate: noop,
        });
        const visor = items.find((i) => i.key === 'project-visor');
        const capas = visor.children.find((c) => c.key === '/visor/layers');
        expect(capas.disabled).toBeFalsy();
    });

    it('editora sin membership ve las opciones del visor deshabilitadas', () => {
        const items = buildSiderItems({
            user: { role: 'editora', projects: [] },
            onNavigate: noop,
        });
        const visor = items.find((i) => i.key === 'project-visor');
        expect(visor.children.every((c) => c.disabled)).toBe(true);
    });

    it('onClick en hijos invoca onNavigate con el path correcto', () => {
        const onNavigate = vi.fn();
        const items = buildSiderItems({
            user: { role: 'tetlamamakani', projects: [] },
            onNavigate,
        });
        const platform = items.find((i) => i.key === 'platform');
        platform.children[0].onClick();
        expect(onNavigate).toHaveBeenCalledWith('/users');
    });

    it('item /inicio dispara onNavigate al click', () => {
        const onNavigate = vi.fn();
        const items = buildSiderItems({
            user: { role: 'editora', projects: [] },
            onNavigate,
        });
        const inicio = items.find((i) => i.key === '/inicio');
        expect(inicio).toBeDefined();
        inicio.onClick();
        expect(onNavigate).toHaveBeenCalledWith('/inicio');
    });

    it('badge de revisiones aparece cuando pendingCount > 0', () => {
        const items = buildSiderItems({
            user: { role: 'tetlamamakani', projects: [] },
            onNavigate: noop,
            extras: { pendingCount: 5 },
        });
        const platform = items.find((i) => i.key === 'platform');
        const revision = platform.children.find((c) => c.key === '/revision');
        expect(revision).toBeDefined();
        expect(revision.label).not.toBe('Revisiones');
    });
});

describe('selectedKeyForPath', () => {
    it('coincide exactamente con un item del sider', () => {
        expect(selectedKeyForPath('/inicio')).toBe('/inicio');
        expect(selectedKeyForPath('/visor/eventos')).toBe('/visor/eventos');
    });

    it('resalta el item base en rutas de detalle', () => {
        expect(selectedKeyForPath('/visor/eventos/123/edit')).toBe('/visor/eventos');
        expect(selectedKeyForPath('/visor/layers/5/edit')).toBe('/visor/layers');
    });

    it('prefiere el prefijo mas largo cuando hay items anidados', () => {
        expect(selectedKeyForPath('/visor/layers/ingesta-masiva')).toBe('/visor/layers/ingesta-masiva');
    });

    it('devuelve el pathname cuando no hay item que coincida', () => {
        expect(selectedKeyForPath('/perfil')).toBe('/perfil');
        expect(selectedKeyForPath('/ruta-inexistente')).toBe('/ruta-inexistente');
    });
});
