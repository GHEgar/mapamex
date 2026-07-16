import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import Badge from '@components/Badge';

const HistoryButton = ({
    count = 0,
    onClick,
    buttonRef,
    isOpen,
    tooltip = 'Mis mediciones y anotaciones',
    className = ''
}) => {
    if (count <= 0) return null;

    return (
        <Tooltip content={tooltip} placement='right' delay={500}>
            <button
                ref={buttonRef}
                type='button'
                onClick={onClick}
                className={[
                    'relative size-12.5 flex items-center justify-center rounded-full border border-transparent transition-all',
                    isOpen ? 'bg-primary-deep' : 'bg-slate-100 hover:border-primary-deep active:bg-primary',
                    className
                ].join(' ')}
                aria-label={`Ver lista de mediciones (${count})`}
            >
                <Icon name='lista' className={`size-10 ${isOpen ? 'text-white' : 'text-primary-deep'}`} />
                <Badge visible={!isOpen} count={count} className='absolute -top-1 -right-1' />
            </button>
        </Tooltip>
    );
};

export default HistoryButton;
