const InfoCard = ({ label, value, className = '' }) => {
    return (
        <div className={`bg-slate-50 rounded-2xl px-3 py-2 ${className}`}>
            <p className="text-[13px] font-sans text-numeralia tracking-normal">
                <span className="font-medium ">{label}:</span>{' '}
                <span className="font-bold text-numeralia">{value}</span>
            </p>
        </div>
    );
};

export default InfoCard;
