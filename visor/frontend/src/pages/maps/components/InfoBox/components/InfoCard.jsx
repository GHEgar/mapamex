import Header from './Header';
import MobileFeatureHeader from './MobileFeatureHeader';

const InfoCard = ({
    title,
    variant = 'desktop',
    index = null,
    total = null,
    onClose,
    maxHeightClass = '',
    className = '',
    children
}) => {
    const isMobile = variant === 'mobile';
    const hasTitle = !!title;

    const heightClass = maxHeightClass ? `flex flex-col ${maxHeightClass}` : '';

    return (
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${heightClass} ${className}`}>
            {hasTitle && (
                isMobile
                    ? <MobileFeatureHeader value={title} index={index} total={total} />
                    : <Header value={title} onClose={onClose} index={index} total={total} />
            )}
            {children}
        </div>
    );
};

export default InfoCard;
