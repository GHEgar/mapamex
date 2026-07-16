import Icon from '@components/Icon';

const Checkbox = ({ checked, onChange, disabled, className = '' }) => {
    const getBackgroundColor = () => {
        if (disabled) return 'bg-slate-100';
        return checked ? 'bg-primary-deep' : 'bg-slate-100';
    };

    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            onClick={!disabled ? onChange : undefined}
            className={`
                relative w-3.5 h-3.5 min-w-3.5 min-h-3.5 rounded mr-2
                shrink-0 flex items-center justify-center
                transition-all duration-200 ease-in-out
                ${getBackgroundColor()}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}
                ${className}
            `}
        >
            {checked && !disabled && (
                <Icon name="check" state="normal" className="w-2.5 h-2.5 text-white" />
            )}
        </button>
    );
};

export default Checkbox;
