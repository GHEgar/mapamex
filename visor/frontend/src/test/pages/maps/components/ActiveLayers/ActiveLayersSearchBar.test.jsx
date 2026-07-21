import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActiveLayersSearchBar from '@pages/maps/components/ActiveLayers/ActiveLayersSearchBar';

const baseProps = {
    searchOpen: true,
    searchQuery: '',
    isFiltering: false,
    displayedLayers: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    unifiedLayers: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
    onChangeSearchQuery: vi.fn(),
    onCloseSearch: vi.fn(),
    onSearchKeyDown: vi.fn(),
    searchInputRef: { current: null },
};

describe('ActiveLayersSearchBar', () => {
    it('no renderiza nada cuando searchOpen=false', () => {
        const { container } = render(<ActiveLayersSearchBar {...baseProps} searchOpen={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renderiza el input cuando searchOpen', () => {
        render(<ActiveLayersSearchBar {...baseProps} />);
        expect(screen.getByPlaceholderText(/buscar capas activas/i)).toBeInTheDocument();
    });

    it('propaga el cambio del query al onChangeSearchQuery', () => {
        const onChangeSearchQuery = vi.fn();
        render(<ActiveLayersSearchBar {...baseProps} onChangeSearchQuery={onChangeSearchQuery} />);
        fireEvent.change(screen.getByPlaceholderText(/buscar capas activas/i), { target: { value: 'lluvia' } });
        expect(onChangeSearchQuery).toHaveBeenCalledWith('lluvia');
    });

    it('muestra cuenta N/Total cuando isFiltering', () => {
        render(<ActiveLayersSearchBar
            {...baseProps}
            isFiltering
            searchQuery="a"
            displayedLayers={[{ id: 'a', name: 'A' }]}
            unifiedLayers={[{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]}
        />);
        expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('el botón X cierra y limpia la búsqueda', () => {
        const onCloseSearch = vi.fn();
        render(<ActiveLayersSearchBar {...baseProps} onCloseSearch={onCloseSearch} />);
        fireEvent.click(screen.getByRole('button', { name: /cerrar y limpiar búsqueda/i }));
        expect(onCloseSearch).toHaveBeenCalled();
    });

    it('propaga keyDown del input para escape u otros', () => {
        const onSearchKeyDown = vi.fn();
        render(<ActiveLayersSearchBar {...baseProps} onSearchKeyDown={onSearchKeyDown} />);
        fireEvent.keyDown(screen.getByPlaceholderText(/buscar capas activas/i), { key: 'Escape' });
        expect(onSearchKeyDown).toHaveBeenCalled();
    });
});
