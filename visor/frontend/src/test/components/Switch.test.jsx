import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Switch from '@components/Switch';

describe('Switch - render y aria', () => {
    it('tiene role="switch"', () => {
        render(<Switch checked={false} onChange={vi.fn()} />);
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('aria-checked es true cuando checked=true', () => {
        render(<Switch checked={true} onChange={vi.fn()} />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('aria-checked es false cuando checked=false', () => {
        render(<Switch checked={false} onChange={vi.fn()} />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('el botón está deshabilitado cuando disabled=true', () => {
        render(<Switch checked={false} onChange={vi.fn()} disabled={true} />);
        expect(screen.getByRole('switch')).toBeDisabled();
    });
});

describe('Switch - interacciones', () => {
    it('llama onChange con true al hacer click en switch desactivado', () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onChange={onChange} />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('llama onChange con false al hacer click en switch activado', () => {
        const onChange = vi.fn();
        render(<Switch checked={true} onChange={onChange} />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('no llama onChange cuando está deshabilitado', () => {
        const onChange = vi.fn();
        render(<Switch checked={false} onChange={onChange} disabled={true} />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe('Switch - clases visuales', () => {
    it('pulgar primary y riel primary-soft cuando checked=true', () => {
        render(<Switch checked={true} onChange={vi.fn()} />);
        const [track, knob] = screen.getByRole('switch').querySelectorAll('span');
        expect(track.className).toContain('bg-primary-soft');
        expect(knob.className).toContain('bg-primary');
        expect(knob.className).not.toContain('bg-primary-soft');
    });

    it('pulgar slate-400 y riel slate-200 cuando checked=false', () => {
        render(<Switch checked={false} onChange={vi.fn()} />);
        const [track, knob] = screen.getByRole('switch').querySelectorAll('span');
        expect(track.className).toContain('bg-slate-200');
        expect(knob.className).toContain('bg-slate-400');
    });

    it('pulgar secondary y riel secondary-soft cuando indeterminate=true', () => {
        render(<Switch checked={false} indeterminate={true} onChange={vi.fn()} />);
        const [track, knob] = screen.getByRole('switch').querySelectorAll('span');
        expect(track.className).toContain('bg-secondary-soft');
        expect(knob.className).toContain('bg-secondary');
        expect(knob.className).not.toContain('bg-secondary-soft');
    });

    it('pulgar slate-300 y riel slate-100 cuando disabled=true', () => {
        render(<Switch checked={false} onChange={vi.fn()} disabled={true} />);
        const [track, knob] = screen.getByRole('switch').querySelectorAll('span');
        expect(track.className).toContain('bg-slate-100');
        expect(knob.className).toContain('bg-slate-300');
    });

    it('con etiquetas usa el color del slot en pulgar, texto y track suave', () => {
        render(<Switch checked={true} onChange={vi.fn()} onLabel="A" offLabel="B" onColor="#E11D74" offColor="#FB7185" />);
        const button = screen.getByRole('switch');
        const [knob, label] = button.querySelectorAll('span');
        expect(button.style.backgroundColor).toBe('rgba(225, 29, 116, 0.14)');
        expect(knob.style.backgroundColor).toBe('#E11D74');
        expect(label.style.color).toBe('#E11D74');
        expect(label.textContent).toBe('A');
    });
});
