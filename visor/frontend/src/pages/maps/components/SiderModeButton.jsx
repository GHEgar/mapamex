import FloatingIconButton from '@components/FloatingIconButton';

const MODES = [
    { key: 'auto', tooltip: 'Automático', icon: 'right_arrow_fill' },
    { key: 'expanded', tooltip: 'Expandido fijo', icon: 'left_arrow_fill' },
    { key: 'collapsed', tooltip: 'Colapsado iconos', icon: 'right_arrow_fill' },
    { key: 'mobile', tooltip: 'Modo mobile', icon: 'down_arrow_fill' },
];

const SiderModeButton = ({ lockMode, onToggle, className = '' }) => {
    const current = MODES.find(m => m.key === lockMode) || MODES[0];
    return (
        <FloatingIconButton
            name={current.icon}
            tooltip={current.tooltip}
            placement="right"
            onClick={onToggle}
            className={className}
        />
    );
};

export default SiderModeButton;
