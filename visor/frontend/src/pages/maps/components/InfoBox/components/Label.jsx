import { CARACTERISTICA_STYLE } from '../utils/cardTemplates';

const FeatureLabel = ({ value, color = CARACTERISTICA_STYLE.color, bg = CARACTERISTICA_STYLE.bg, fullWidth = false, variant = 'desktop' }) => {
    if (!value) return null;

    const size = variant === 'mobile' ? 'text-xs' : 'text-[10px]/[14px]';

    if (fullWidth) {
        return (
            <div className="w-full">
                <p
                    className={`font-sans font-bold ${size} px-2 py-1 rounded-2xl w-fit`}
                    style={{ color, backgroundColor: bg }}
                >
                    {value}
                </p>
            </div>
        );
    }

    return (
        <p
            className={`font-sans font-bold ${size} px-2 py-1 rounded-2xl`}
            style={{ color, backgroundColor: bg }}
        >
            {value}
        </p>
    );
};

export default FeatureLabel;
