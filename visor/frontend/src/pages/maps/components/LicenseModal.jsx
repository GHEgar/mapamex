import Modal from '@components/Modal';

const LICENSE_POINTS = [
    { label: 'Uso libre', text: 'Puedes usar, estudiar y ejecutar el software para cualquier propósito.' },
    { label: 'Modificación', text: 'Puedes modificar el código fuente y crear obras derivadas.' },
    { label: 'Distribución', text: 'Puedes redistribuir copias, siempre bajo esta misma licencia.' },
    { label: 'Uso en red', text: 'Si ofreces el software como servicio en red, debes poner el código fuente (incluidas tus modificaciones) a disposición de los usuarios.' },
    { label: 'Sin garantía', text: 'El software se distribuye tal cual, sin garantía de ningún tipo.' },
];

const LicenseModal = ({ isOpen, onClose }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Licencia AGPL 3.0"
        width="max-w-sm"
        height="max-h-[70vh]"
    >
        <div className="px-6 py-4 space-y-4">
            <p className="text-xs text-graphite leading-5">
                MapaMex es software libre distribuido bajo la licencia{' '}
                <span className="font-semibold">GNU Affero General Public License v3.0 (AGPL-3.0)</span>.
            </p>
            <ul className="space-y-2">
                {LICENSE_POINTS.map((point) => (
                    <li key={point.label} className="flex items-start gap-2 text-xs text-graphite">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-primary" />
                        <span className="flex-1">
                            <span className="font-semibold">{point.label}:</span> {point.text}
                        </span>
                    </li>
                ))}
            </ul>
            <p className="text-xs text-graphite leading-5">
                Este resumen es informativo y no sustituye el texto legal. Consulta el{' '}
                <a
                    href="https://www.gnu.org/licenses/agpl-3.0.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline hover:text-primary-deep"
                >
                    texto completo de la licencia
                </a>.
            </p>
        </div>
    </Modal>
);

export default LicenseModal;
