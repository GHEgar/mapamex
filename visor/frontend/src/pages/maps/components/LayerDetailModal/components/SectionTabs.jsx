const WRAP = 'bg-white border-2 border-slate-200 rounded-full p-1';
const PILL = 'flex items-center justify-center h-8 rounded-full transition-colors text-[13px] font-sans font-medium px-4';

const pillClass = (active) => `${PILL} ${active
    ? 'bg-primary text-white shadow-sm'
    : 'text-graphite hover:text-primary-deep hover:bg-slate-50'}`;

const SectionTabs = ({ tabs, active, onChange }) => {
    if (!tabs?.length) return null;
    return (
        <div role="tablist" aria-label="Secciones" className={`w-full flex gap-1 ${WRAP}`}>
            {tabs.map(({ key, label }) => (
                <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active === key}
                    onClick={() => onChange(key)}
                    className={`flex-1 cursor-pointer ${pillClass(active === key)}`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default SectionTabs;
