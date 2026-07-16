import { formatNumber } from '@pages/maps/helpers/formatNumber';

const StatCard = ({ label, value, simbolo, className = '' }) => {
    return (
        <div className={`bg-slate-100 rounded-2xl p-3.5 min-h-auto flex flex-col justify-center ${className}`}>
            <div className="flex flex-col items-center justify-center text-center w-full">
                <p className="text-[16px]/[30px] font-sans font-bold text-primary">
                    {formatNumber(value)}{simbolo && <span className="text-xs font-medium ml-1">{simbolo}</span>}
                </p>
                <p className="text-[13px]/[16px] font-sans font-medium text-graphite tracking-normal">
                    {label}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
