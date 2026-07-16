import { BRAND } from '@constants/brand';

const Bar = ({ min = 0, max = 100, step = 1, value, onChange, fillColor = BRAND.PRIMARY_DEEP, className = '' }) => {
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className={`w-full h-2 rounded-2xl appearance-none cursor-pointer accent-secondary ${className}`}
            style={{
                background: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${pct}%, rgb(70 80 85 / 0.2) ${pct}%, rgb(70 80 85 / 0.2) 100%)`
            }}
        />
    );
};

export default Bar;
