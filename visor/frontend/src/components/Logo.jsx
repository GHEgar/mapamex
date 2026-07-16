import Tooltip from '@components/Tooltip';
import Loading from '@components/Loading';
import logoLarge from '@assets/logos/mapamex_large.svg';
import logoLargeDark from '@assets/logos/mapamex_large_dark.svg';
import logoShort from '@assets/logos/mapamex_short.svg';
import logoVisorLarge from '@assets/logos/visor_large.svg';
import logoVisorLargeDark from '@assets/logos/visor_large_dark.svg';
import logoVisorShort from '@assets/logos/visor_short.svg';
import logoVisorSquare from '@assets/logos/visor_square.svg';

const colorFilters = {
    '#CBC5F1': 'brightness(0) saturate(100%) invert(83%) sepia(12%) saturate(746%) hue-rotate(206deg) brightness(101%) contrast(92%)',
    '#FFB98E': 'brightness(0) saturate(100%) invert(78%) sepia(31%) saturate(597%) hue-rotate(329deg) brightness(101%) contrast(101%)',
};

const Logo = ({
    name,
    alt = '',
    className = '',
    size = 'size-12',
    expanded = false,
    variant = 'light',
    isLoading = false,
    type = null,
    tooltip = null,
    tooltipPlacement = 'right',
    colorFilter = null,
    onClick = null,
    href = null,
    target = '_blank',
    visible = true
}) => {
    if (!visible) return null;

    const logos = {
        visor: {
            light: {
                large: logoVisorLarge,
                short: logoVisorShort,
                square: logoVisorSquare,
            },
            dark: {
                large: logoVisorLargeDark,
                short: logoVisorShort,
                square: logoVisorSquare,
            }
        },
        mapamex: {
            light: {
                large: logoLarge,
                short: logoShort
            },
            dark: {
                large: logoLargeDark,
                short: logoShort
            }
        }
    };

    const currentLogo = logos[name]?.[variant] || logos[name]?.light;

    if (!currentLogo) return null;

    const filterStyle = colorFilter && colorFilters[colorFilter]
        ? { filter: colorFilters[colorFilter] }
        : {};

    const Wrapper = href ? 'a' : 'div';
    const wrapperProps = href
        ? { href, target, rel: 'noopener noreferrer', className: `flex items-center justify-center ${className} cursor-pointer` }
        : { onClick, className: `flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}` };

    const spinner = isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
            <Loading visible size="h-3/5 aspect-square" />
        </div>
    );

    const renderContent = () => {
        if (type && currentLogo[type]) {
            return (
                <Wrapper {...wrapperProps}>
                    <div className={`relative ${size}`}>
                        {spinner}
                        <img
                            src={currentLogo[type]}
                            alt={alt || `Logo ${name} ${type}`}
                            style={filterStyle}
                            className={`
                                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                w-full h-full object-contain
                                transition-all duration-500 ease-in-out
                                ${isLoading ? 'opacity-0' : 'opacity-100'}
                            `}
                        />
                    </div>
                </Wrapper>
            );
        }

        return (
            <Wrapper {...wrapperProps}>
                <div className={`relative ${size}`}>
                    {spinner}
                    <img
                        src={currentLogo.short}
                        alt={alt || `Logo ${name} corto`}
                        style={filterStyle}
                        className={`
                            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-full h-full object-contain
                            transition-all duration-500 ease-in-out
                            ${isLoading || expanded ? 'opacity-0' : 'opacity-100'}
                        `}
                    />
                    <img
                        src={currentLogo.large}
                        alt={alt || `Logo ${name} completo`}
                        style={filterStyle}
                        className={`
                            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-full h-full object-contain
                            transition-all duration-500 ease-in-out
                            ${isLoading || !expanded ? 'opacity-0' : 'opacity-100'}
                        `}
                    />
                </div>
            </Wrapper>
        );
    };

    if (tooltip) {
        return (
            <Tooltip content={tooltip} placement={tooltipPlacement} variant="normal">
                {renderContent()}
            </Tooltip>
        );
    }

    return renderContent();
};

export default Logo;
