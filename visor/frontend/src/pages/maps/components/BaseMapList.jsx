import { useState } from 'react';
import { BASEMAP_ORDER } from '@pages/maps/helpers/basemaps';
import { useMapsContext } from '@hooks/useMaps';
import Icon from '@components/Icon';
import { trackBasemapChange } from '@services/analyticsService';

const BaseMapList = ({ closeButton }) => {
    const { baseMapId, setBaseMapId, basemaps } = useMapsContext();
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <div className="py-6 px-4">
            <div className="flex items-center justify-between">
                <h3 className="block text-[18px]/[47px] font-sans font-bold mb-2 text-primary tracking-normal">
                    Mapas Base
                </h3>
                {closeButton}
            </div>
            <div className="grid grid-cols-2 gap-4">
                {BASEMAP_ORDER.map(id => {
                    const active = baseMapId === id;
                    const label = basemaps[id]?.label ?? id;

                    return (
                        <button
                            key={id}
                            onClick={() => { setBaseMapId(id); trackBasemapChange(id); }}
                            onMouseEnter={() => setHoveredId(id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                                flex flex-col items-center justify-center gap-2 cursor-pointer
                                w-[138px] h-[142px] p-3 rounded-2xl bg-transparent border
                                ${active ? 'border-primary-deep' : 'border-transparent hover:border-primary-deep'}
                            `}
                            title={label}
                        >
                            <div className="flex items-center justify-center">
                                <Icon
                                    name={id}
                                    state={active || hoveredId === id ? 'hover' : 'normal'}
                                    className={`${active || hoveredId === id ? 'size-[57px]' : 'size-[47px]'}`}
                                />
                            </div>
                            <span className={`text-[12px]/[18px] font-sans text-center ${active ? 'font-bold text-primary' : 'font-medium text-graphite'}`}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BaseMapList;
