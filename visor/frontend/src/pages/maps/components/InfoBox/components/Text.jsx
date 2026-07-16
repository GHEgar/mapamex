const FeatureText = ({ label, value, href = null, variant = 'desktop' }) => {
    const size = variant === 'mobile' ? 'text-xs' : 'text-[10px]';
    const valueEl = href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
            {value}
        </a>
    ) : (
        <span className="font-medium">{value}</span>
    );
    return (
        <div className={`font-sans ${size} text-graphite tracking-normal mb-3`}>
            {label && <span className="font-bold">{label}</span>}
            {label && value && <span>: </span>}
            {value && valueEl}
        </div>
    );
};

export default FeatureText;
