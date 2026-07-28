import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SiderProvider } from '@contexts/SiderContext';
import ActiveLayersMenu from '@pages/maps/components/ActiveLayers/ActiveLayersMenu';

const baseProps = {
    noLayers: false,
    unifiedLayers: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    allHidden: false,
    visibilityCount: 2,
    hasActiveLoops: false,
    activeLoopsCount: 0,
    onToggleVisibilityAll: vi.fn(),
    onRemoveAll: vi.fn(),
    onPauseAll: vi.fn(),
    onOpenSearch: vi.fn(),
    onAnyPanelOpenChange: vi.fn(),
};

const renderMenu = (props = {}) =>
    render(
        <SiderProvider>
            <ActiveLayersMenu {...baseProps} {...props} />
        </SiderProvider>
    );

const openMenu = () => fireEvent.click(screen.getByRole('button', { name: /acciones de capas/i }));

describe('ActiveLayersMenu', () => {
    it('el contenido del menú no está visible hasta abrir el kebab', () => {
        renderMenu();
        expect(screen.queryByText(/Ocultar mis capas/i)).not.toBeInTheDocument();
    });

    it('abre el menú y muestra las filas de acción', () => {
        renderMenu();
        openMenu();
        expect(screen.getByText(/Ocultar mis capas/i)).toBeInTheDocument();
        expect(screen.getByText(/Buscar capas/i)).toBeInTheDocument();
        expect(screen.getByText(/Eliminar mis capas/i)).toBeInTheDocument();
    });

    it('invoca onOpenSearch al hacer click en Buscar', () => {
        const onOpenSearch = vi.fn();
        renderMenu({ onOpenSearch });
        openMenu();
        fireEvent.click(screen.getByText(/Buscar capas/i));
        expect(onOpenSearch).toHaveBeenCalled();
    });

    it('invoca onToggleVisibilityAll al hacer click en la fila de visibilidad', () => {
        const onToggleVisibilityAll = vi.fn();
        renderMenu({ onToggleVisibilityAll });
        openMenu();
        fireEvent.click(screen.getByText(/Ocultar mis capas/i));
        expect(onToggleVisibilityAll).toHaveBeenCalled();
    });

    it('cambia el label de visibilidad cuando allHidden=true', () => {
        renderMenu({ allHidden: true });
        openMenu();
        expect(screen.getByText(/Mostrar mis capas/i)).toBeInTheDocument();
    });

    it('muestra la fila de pausar animaciones cuando hasActiveLoops', () => {
        const onPauseAll = vi.fn();
        renderMenu({ hasActiveLoops: true, activeLoopsCount: 2, onPauseAll });
        openMenu();
        fireEvent.click(screen.getByText(/Pausar animaciones/i));
        expect(onPauseAll).toHaveBeenCalled();
    });

    it('confirma antes de eliminar y dispara onRemoveAll', () => {
        const onRemoveAll = vi.fn();
        renderMenu({ onRemoveAll });
        openMenu();
        fireEvent.click(screen.getByText(/Eliminar mis capas/i));
        fireEvent.click(screen.getByText(/Sí. Quiero borrar todas las capas/i));
        expect(onRemoveAll).toHaveBeenCalled();
    });

    it('deshabilita las filas de acción cuando noLayers', () => {
        renderMenu({ noLayers: true, unifiedLayers: [], visibilityCount: 0 });
        openMenu();
        expect(screen.getByText(/Buscar capas/i).closest('button')).toBeDisabled();
        expect(screen.getByText(/Ocultar mis capas/i).closest('button')).toBeDisabled();
    });
});
