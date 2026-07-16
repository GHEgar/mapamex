import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Icon from '@components/Icon';

describe('Icon', () => {
    it('renderiza un icono Lucide como <svg> (no <img>)', () => {
        const { container } = render(<Icon name="close" />);
        expect(container.querySelector('svg')).toBeInTheDocument();
        expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('aplica el color por state cuando className no trae text-*', () => {
        const { container } = render(<Icon name="eliminar" state="hover" className="size-4" />);
        expect(container.querySelector('svg').getAttribute('class')).toContain('text-primary');
    });

    it('state normal hereda currentColor (sin clase text-*)', () => {
        const { container } = render(<Icon name="eliminar" className="size-4" />);
        expect(container.querySelector('svg').getAttribute('class')).not.toMatch(/(^|\s)text-/);
    });

    it('state normal usa el color declarado por la entrada (simbologia)', () => {
        const { container } = render(<Icon name="simbologia" className="size-4" />);
        expect(container.querySelector('svg').getAttribute('class')).toContain('text-primary');
    });

    it('no pisa un text-* pasado por el caller', () => {
        const { container } = render(<Icon name="close" state="hover" className="size-4 text-white" />);
        const cls = container.querySelector('svg').getAttribute('class');
        expect(cls).toContain('text-white');
        expect(cls).not.toContain('text-primary');
    });

    it('visible cambia de glifo por state (Eye ↔ EyeOff)', () => {
        const { container: on } = render(<Icon name="visible" state="normal" className="size-4" />);
        const { container: off } = render(<Icon name="visible" state="hover" className="size-4" />);
        expect(on.querySelector('svg').innerHTML).not.toBe(off.querySelector('svg').innerHTML);
        expect(on.querySelector('svg').getAttribute('class')).toContain('text-primary');
        expect(off.querySelector('svg').getAttribute('class')).toContain('text-graphite');
    });

    it('aplica tamaño default w-5 h-5 solo si className no trae tamaño', () => {
        const { container: sinTamano } = render(<Icon name="close" className="shrink-0" />);
        expect(sinTamano.querySelector('svg').getAttribute('class')).toContain('w-5 h-5');
        const { container: conTamano } = render(<Icon name="close" className="size-7" />);
        expect(conTamano.querySelector('svg').getAttribute('class')).not.toContain('w-5 h-5');
    });

    it('las tematicas migradas renderizan <svg> lucide', () => {
        const { container } = render(<Icon name="demografia" state="normal" />);
        expect(container.querySelector('svg')).toBeInTheDocument();
        expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('un id de categoria renderiza su glifo lucide', () => {
        const { container } = render(<Icon name="salud" state="hover" />);
        expect(container.querySelector('svg')).toBeInTheDocument();
        expect(container.querySelector('svg').getAttribute('class')).toContain('text-primary');
    });

    it('los alias legacy renderizan el mismo glifo que su nombre nuevo', () => {
        const { container: a } = render(<Icon name="cerrar" className="size-4 text-white" />);
        const { container: b } = render(<Icon name="close" className="size-4 text-white" />);
        expect(a.querySelector('svg').innerHTML).toBe(b.querySelector('svg').innerHTML);
    });

    it('devuelve null para nombres desconocidos', () => {
        const { container } = render(<Icon name="no_existe" />);
        expect(container.firstChild).toBeNull();
    });

    it('envuelve en <button> cuando hay onClick', () => {
        render(<Icon name="close" onClick={() => {}} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
