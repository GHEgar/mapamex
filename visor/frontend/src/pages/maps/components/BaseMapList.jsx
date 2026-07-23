import { useMapsContext } from '@hooks/useMaps';
import Icon from '@components/Icon';
import { trackBasemapChange } from '@services/analyticsService';

const BaseMapList = ({ closeButton }) => {
    const { baseMapId, setBaseMapId, basemaps, basemapOrder } = useMapsContext();

    return (
        <div className="py-5 px-4">
            <div className="flex items-center justify-between min-h-8 mb-3">
                <h3 className="font-sans font-bold text-[15px]/[20px] text-numeralia tracking-normal">
                    Mapas base
                </h3>
                {closeButton}
            </div>
            <div className="flex flex-col gap-1.5">
                {basemapOrder.map(id => {
                    const active = baseMapId === id;
                    const label = basemaps[id]?.label ?? id;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => { setBaseMapId(id); trackBasemapChange(id); }}
                            aria-pressed={active}
                            title={label}
                            className={`flex items-center gap-3 p-2 rounded-2xl border transition-colors cursor-pointer text-left ${active ? 'border-primary-deep bg-primary-soft/40' : 'border-transparent hover:bg-slate-100'}`}
                        >
                            <span className={`shrink-0 flex items-center justify-center size-11 rounded-xl bg-white border ${active ? 'border-primary' : 'border-slate-200'}`}>
                                <Icon name={id} state={active ? 'hover' : 'normal'} className="size-7" />
                            </span>
                            <span className={`flex-1 min-w-0 truncate text-[13px] font-sans ${active ? 'font-bold text-primary' : 'font-medium text-graphite'}`}>
                                {label}
                            </span>
                            <span className={`shrink-0 flex items-center justify-center size-4.5 rounded-full border-2 ${active ? 'border-primary-deep' : 'border-slate-300'}`}>
                                {active && <span className="size-2 rounded-full bg-primary-deep" />}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BaseMapList;
