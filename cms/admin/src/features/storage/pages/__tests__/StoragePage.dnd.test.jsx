import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import StoragePage from '@features/storage/pages/StoragePage';

vi.mock('@shared/hooks/useIsMobile', () => ({
    default: () => ({ isMobile: false }),
}));

vi.mock('@features/storage/api/storageService', () => ({
    default: {
        getBuckets: vi.fn(),
        getStorageFiles: vi.fn(),
        getFolders: vi.fn(),
        uploadStorageFile: vi.fn(),
        initChunkedUpload: vi.fn(),
        uploadChunk: vi.fn(),
        completeChunkedUpload: vi.fn(),
        updateStorageFile: vi.fn(),
        moveStorageFile: vi.fn(),
        deleteStorageFile: vi.fn(),
        deleteMultipleFiles: vi.fn(),
        createFolder: vi.fn(),
        deleteFolder: vi.fn(),
        getFolderInfo: vi.fn(),
        buildFolderZipUrl: vi.fn(() => '#'),
        formatFileSize: (bytes) => `${bytes} B`,
    },
}));

import storageService from '@features/storage/api/storageService';

const BUCKET = { id: 6, storage_bucket: 'mapamex', display_name: 'MapaMex', is_public: true };

const mkFile = (name) => new File(['contenido'], name, { type: 'image/svg+xml' });

describe('StoragePage drag & drop', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        storageService.getBuckets.mockResolvedValue([BUCKET]);
        storageService.getStorageFiles.mockResolvedValue([]);
        storageService.getFolders.mockResolvedValue([]);
        storageService.uploadStorageFile.mockResolvedValue({ id: 1 });
    });

    it('soltar varios archivos sobre la rejilla dispara una subida por archivo', async () => {
        render(<StoragePage />);
        const zone = await screen.findByTestId('storage-drop-zone');
        await waitFor(() => expect(storageService.getBuckets).toHaveBeenCalled());
        await waitFor(() => expect(storageService.getStorageFiles).toHaveBeenCalled());

        const files = [mkFile('a.svg'), mkFile('b.svg'), mkFile('c.svg')];
        fireEvent.drop(zone, {
            dataTransfer: { files, items: [], types: ['Files'] },
        });

        await waitFor(() => expect(storageService.uploadStorageFile).toHaveBeenCalledTimes(3));
        const folders = storageService.uploadStorageFile.mock.calls.map(([, opts]) => opts.folder);
        expect(folders).toEqual(['/', '/', '/']);
    });

    it('drop con dataTransfer.items como fallback (files vacio)', async () => {
        render(<StoragePage />);
        const zone = await screen.findByTestId('storage-drop-zone');
        await waitFor(() => expect(storageService.getStorageFiles).toHaveBeenCalled());

        const items = [mkFile('x.svg'), mkFile('y.svg')].map((f) => ({
            kind: 'file',
            getAsFile: () => f,
        }));
        fireEvent.drop(zone, {
            dataTransfer: { files: [], items, types: ['Files'] },
        });

        await waitFor(() => expect(storageService.uploadStorageFile).toHaveBeenCalledTimes(2));
    });

    it('archivo volátil (lectura falla) no se sube y no bloquea a los demás', async () => {
        render(<StoragePage />);
        const zone = await screen.findByTestId('storage-drop-zone');
        await waitFor(() => expect(storageService.getStorageFiles).toHaveBeenCalled());

        const volatil = mkFile('caduco.svg');
        volatil.arrayBuffer = () => Promise.reject(new DOMException('not found', 'NotFoundError'));
        const files = [volatil, mkFile('sano.svg')];
        fireEvent.drop(zone, {
            dataTransfer: { files, items: [], types: ['Files'] },
        });

        await waitFor(() => expect(storageService.uploadStorageFile).toHaveBeenCalledTimes(1));
        const [uploaded] = storageService.uploadStorageFile.mock.calls[0];
        expect(uploaded.name).toBe('sano.svg');
    });

    it('lote completamente ilegible deshabilita la zona de arrastre (persistido)', async () => {
        render(<StoragePage />);
        const zone = await screen.findByTestId('storage-drop-zone');
        await waitFor(() => expect(storageService.getStorageFiles).toHaveBeenCalled());

        const files = [mkFile('a.svg'), mkFile('b.svg')];
        files.forEach((f) => {
            f.arrayBuffer = () => Promise.reject(new DOMException('not found', 'NotFoundError'));
        });
        fireEvent.drop(zone, { dataTransfer: { files, items: [], types: ['Files'] } });

        await waitFor(() => expect(localStorage.getItem('cms.storage.dndUnsupported')).toBe('1'));
        expect(storageService.uploadStorageFile).not.toHaveBeenCalled();

        fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'] } });
        expect(screen.queryByText(/Suelta para subir/)).toBeNull();
    });

    it('un drop legible re-habilita la zona de arrastre', async () => {
        localStorage.setItem('cms.storage.dndUnsupported', '1');
        render(<StoragePage />);
        const zone = await screen.findByTestId('storage-drop-zone');
        await waitFor(() => expect(storageService.getStorageFiles).toHaveBeenCalled());

        fireEvent.drop(zone, {
            dataTransfer: { files: [mkFile('ok.svg')], items: [], types: ['Files'] },
        });

        await waitFor(() => expect(storageService.uploadStorageFile).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(localStorage.getItem('cms.storage.dndUnsupported')).toBe('0'));
    });

    it('drop sin archivos no dispara subidas', async () => {
        render(<StoragePage />);
        const zone = await screen.findByTestId('storage-drop-zone');
        await waitFor(() => expect(storageService.getStorageFiles).toHaveBeenCalled());

        fireEvent.drop(zone, {
            dataTransfer: { files: [], items: [], types: ['text/uri-list'] },
        });

        await new Promise((r) => setTimeout(r, 50));
        expect(storageService.uploadStorageFile).not.toHaveBeenCalled();
    });
});
