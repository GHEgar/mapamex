import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';

const FloatingIconButton = ({
    name,
    tooltip,
    onClick,
    placement = 'right',
    delay = 0,
    ariaLabel,
    className = '',
}) => (
    <Tooltip content={tooltip} placement={placement} delay={delay}>
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel || tooltip}
            className={`cursor-pointer size-10 rounded-full bg-white shadow-md flex items-center justify-center text-graphite hover:text-primary transition-all duration-200 ${className}`}
        >
            <Icon name={name} className="size-5 text-inherit" />
        </button>
    </Tooltip>
);

export default FloatingIconButton;
