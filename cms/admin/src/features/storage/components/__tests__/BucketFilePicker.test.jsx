import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BucketFilePicker from '@features/storage/components/BucketFilePicker';

vi.mock('@features/storage/api/storageService', () => ({
    getStorageFiles: vi.fn(),
    getBuckets: vi.fn(() => Promise.resolve([])),
}));

import { getStorageFiles } from '@features/storage/api/storageService';

const SAMPLE_FILES = [
    {
        name: 'fotos/perfil.jpg',
        originalName: 'perfil.jpg',
        isDir: false,
        url: 'https://storage.example.com/portal-bucket/fotos/perfil.jpg',
    },
    {
        name: 'docs/informe.pdf',
        originalName: 'informe.pdf',
        isDir: false,
        url: 'https://storage.example.com/portal-bucket/docs/informe.pdf',
    },
    {
        name: 'banners/header.webp',
        originalName: 'header.webp',
        isDir: false,
        url: 'https://storage.example.com/portal-bucket/banners/header.webp',
    },
];

describe('BucketFilePicker', () => {
    beforeEach(() => {
        getStorageFiles.mockReset();
        getStorageFiles.mockResolvedValue(SAMPLE_FILES);
    });

    it('no llama a getStorageFiles cuando open=false', () => {
        render(
            <BucketFilePicker
                open={false}
                onClose={vi.fn()}
                onSelect={vi.fn()}
                bucketId={1}
            />,
        );
        expect(getStorageFiles).not.toHaveBeenCalled();
    });

    it('lista los archivos del bucket cuando open=true', async () => {
        render(
            <BucketFilePicker
                open
                onClose={vi.fn()}
                onSelect={vi.fn()}
                bucketId={1}
            />,
        );
        await waitFor(() => {
            expect(getStorageFiles).toHaveBeenCalledWith({
                bucketId: 1,
                folder: undefined,
                search: undefined,
                recursive: false,
            });
        });
        expect(await screen.findByText('perfil.jpg')).toBeInTheDocument();
        expect(screen.getByText('informe.pdf')).toBeInTheDocument();
        expect(screen.getByText('header.webp')).toBeInTheDocument();
    });

    it('click en una fila llama onSelect con {nombre, enlace, url, bucketId} y cierra', async () => {
        const onSelect = vi.fn();
        const onClose = vi.fn();
        render(
            <BucketFilePicker
                open
                onClose={onClose}
                onSelect={onSelect}
                bucketId={1}
            />,
        );
        const row = await screen.findByText('perfil.jpg');
        fireEvent.click(row);
        expect(onSelect).toHaveBeenCalledWith({
            nombre: 'perfil.jpg',
            enlace: '/fotos/perfil.jpg',
            url: 'https://storage.example.com/portal-bucket/fotos/perfil.jpg',
            bucketId: 1,
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('la búsqueda refetcha con search y recursive=true', async () => {
        render(
            <BucketFilePicker
                open
                onClose={vi.fn()}
                onSelect={vi.fn()}
                bucketId={1}
            />,
        );
        await screen.findByText('perfil.jpg');

        const search = screen.getByPlaceholderText('Buscar por nombre');
        fireEvent.change(search, { target: { value: 'perfil' } });

        await waitFor(() => {
            expect(getStorageFiles).toHaveBeenCalledWith({
                bucketId: 1,
                folder: undefined,
                search: 'perfil',
                recursive: true,
            });
        });
    });
});
