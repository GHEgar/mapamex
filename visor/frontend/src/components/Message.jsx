import { useState } from 'react';
import Icon from './Icon';
import { renderInlineMarkdown } from '@utils/inlineMarkdown';

const isUrlIcon = (value) =>
    typeof value === 'string'
    && (value.startsWith('http://')
        || value.startsWith('https://')
        || value.startsWith('/storage/')
        || value.startsWith('/api/'));

const variantStyles = {
    warning: {
        border: 'border-secondary',
        accent: 'bg-secondary',
        title: 'text-secondary',
        message: 'text-graphite',
        defaultIcon: 'rendimiento',
    },
    info: {
        border: 'border-primary',
        accent: 'bg-primary',
        title: 'text-primary',
        message: 'text-graphite',
        defaultIcon: 'tiempo_alert',
    },
    neutral: {
        border: 'border-[#9CA3AF]',
        accent: 'bg-[#9CA3AF]',
        title: 'text-graphite',
        message: 'text-graphite',
        defaultIcon: null,
    },
};

const SIZE_PRESETS = {
    large: {
        padding: 'gap-3 md:gap-5 px-4 md:px-5 py-4 md:py-5',
        icon: 'size-14 md:size-[74px]',
        title: 'text-base leading-6 md:text-lg md:leading-[26px]',
        description: 'text-[13px] leading-[18px] md:text-sm md:leading-5',
        closeBtn: '-m-1 md:-m-2 p-2 md:p-2.5 min-w-11 min-h-11',
    },
    medium: {
        padding: 'gap-3 md:gap-4 px-4 py-3 md:py-4',
        icon: 'size-14 md:size-16',
        title: 'text-[15px] leading-[22px] md:text-base md:leading-6',
        description: 'text-[13px] leading-[18px] md:text-sm md:leading-5',
        closeBtn: '-m-1 p-2 min-w-10 min-h-10',
    },
    small: {
        padding: 'gap-3 px-4 py-3',
        icon: 'size-12 md:size-14',
        title: 'text-sm leading-5 md:text-[15px] md:leading-[22px]',
        description: 'text-xs leading-[18px] md:text-[13px] md:leading-[18px]',
        closeBtn: '-m-1 p-2 min-w-10 min-h-10',
    },
    compact: {
        padding: 'gap-3 px-4 py-3',
        icon: 'size-10',
        title: 'text-sm',
        description: 'text-xs',
        closeBtn: 'p-1',
    },
};

const Message = ({
    variant = 'info',
    title,
    description,
    icon,
    className = '',
    closable = false,
    storageKey,
    onClose,
    children,
    size = 'large',
}) => {
    const sessionKey = storageKey ? `message_closed_${storageKey}` : null;
    const [closed, setClosed] = useState(() => {
        if (!closable || !sessionKey || onClose) return false;
        return sessionStorage.getItem(sessionKey) === '1';
    });

    const styles = variantStyles[variant] || variantStyles.info;
    const iconName = icon ?? styles.defaultIcon;
    const preset = SIZE_PRESETS[size] || SIZE_PRESETS.large;
    const radiusClass = size === 'compact' ? 'rounded-2xl' : 'rounded-2xl';
    const shadowClass = size === 'compact' ? '' : 'shadow-[0px_3px_24px_#00000029]';

    if (closed) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }
        if (sessionKey) {
            sessionStorage.setItem(sessionKey, '1');
        }
        setClosed(true);
    };

    return (
        <div className={`flex ${radiusClass} ${shadowClass} bg-white overflow-hidden font-sans ${className}`}>
            <div className={`flex items-start w-full ${preset.padding}`}>
                {iconName && (
                    isUrlIcon(iconName)
                        ? <img src={iconName} alt="" aria-hidden="true" className={`${preset.icon} shrink-0 object-contain self-center`} />
                        : <Icon name={iconName} className={`${preset.icon} shrink-0 self-center ${styles.title}`} />
                )}
                <div className="min-w-0 flex-1 self-center">
                    {title && (
                        <p className={`${preset.title} font-bold ${styles.title} tracking-normal`}>
                            {title}
                        </p>
                    )}
                    {description && (
                        <p className={`${preset.description} font-medium text-graphite tracking-normal`}>
                            {renderInlineMarkdown(description)}
                        </p>
                    )}
                    {children}
                </div>
                {closable && (
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Cerrar"
                        className={`shrink-0 self-center rounded-full hover:bg-[#F0F0F0] transition-colors cursor-pointer flex items-center justify-center ${preset.closeBtn}`}
                    >
                        <Icon name="close" className="size-4 text-graphite" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Message;
