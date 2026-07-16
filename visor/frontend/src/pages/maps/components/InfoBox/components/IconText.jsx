import Divider from '@components/Divider';
import Icon from '@components/Icon';

const buildHref = (icon, value) => {
    if (!value) return null;
    const str = String(value);
    if (icon === 'celular') return `tel:${str.replace(/\s+/g, '')}`;
    if (icon === 'ubicacion') return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str)}`;
    if (icon === 'web') return /^https?:\/\//i.test(str) ? str : `https://${str}`;
    return null;
};

const IconText = ({ value, hrefValue = null, icon = 'ubicacion', showDivider = true, isLast = false, href: externalHref = null, onClick = null, variant = 'desktop' }) => {
    if (!value) return null;

    const href = externalHref || buildHref(icon, hrefValue ?? value);
    const isClickable = href || onClick;
    const size = variant === 'mobile' ? 'text-xs' : 'text-[10px]/[14px]';
    const textClass = `flex-1 font-sans font-medium ${size} tracking-normal`;

    return (
        <>
            {showDivider && <Divider className="my-2" />}
            <div className={`flex items-center gap-2 py-1${isLast ? ' mb-3' : ''}`}>
                <Icon name={icon} className="w-3.5 h-3.5 shrink-0" />
                {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={`${textClass} text-primary underline`}>
                        {value}
                    </a>
                ) : onClick ? (
                    <button onClick={onClick} className={`${textClass} text-primary underline text-left cursor-pointer`}>
                        {value}
                    </button>
                ) : (
                    <span className={`${textClass} ${isClickable ? 'text-primary underline' : 'text-[#454545]'}`}>
                        {value}
                    </span>
                )}
            </div>
        </>
    );
};

export default IconText;
