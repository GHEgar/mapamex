import Icon from '@components/Icon';

const themeToIconMap = {
    'General': 'base_layers',
    'Demografía': 'demografia',
    'Salud': 'salud',
    'Economía': 'economia',
    'Educación': 'educacion',
    'Recursos y calidad de vida': 'recursos',
    'Recursos y Calidad de Vida': 'recursos',
    'Desarrollo social': 'desarrollo',
    'Desarrollo Social': 'desarrollo',
    'Seguridad': 'seguridad',
    'Seguridad y Protección Ciudadana': 'seguridad',
    'Gobierno y ciudadanía': 'gobierno',
    'Gobierno y Ciudadanía': 'gobierno',
    'Raster (Clima)': 'raster',
    'Mundial': 'mundial',
};

const normalize = (str) =>
    str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

const normalizedMap = Object.fromEntries(
    Object.entries(themeToIconMap).map(([key, value]) => [normalize(key), value])
);

const resolveIcon = (name, icon) =>
    themeToIconMap[name] || normalizedMap[normalize(name)] || icon;

const LayerThemeAvatar = ({ icon, name, imageUrl, size = 'md' }) => {
    const sizeClasses = {
        sm: 'size-10',
        md: 'size-16',
        lg: 'size-20'
    };

    const iconSizeClasses = {
        sm: 'size-6',
        md: 'size-10',
        lg: 'size-12'
    };

    if (imageUrl) {
        return (
            <div className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden rounded-2xl`} title={name}>
                <img src={imageUrl} alt={name || ''} loading="lazy" decoding="async" className="size-full object-cover" />
            </div>
        );
    }

    const iconName = resolveIcon(name, icon);

    return (
        <div className={`${sizeClasses[size]} flex items-center justify-center`} title={name}>
            <Icon name={iconName || 'layers'} state="hover" className={iconSizeClasses[size]} />
        </div>
    );
};

export default LayerThemeAvatar;
