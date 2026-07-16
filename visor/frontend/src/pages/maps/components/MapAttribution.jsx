import { useState } from 'react';
import { useMapsContext } from '@hooks/useMaps';
import { BASEMAPS } from '@pages/maps/helpers/basemaps';
import ReportButton from '@components/ReportButton';
import LicenseModal from '@pages/maps/components/LicenseModal';

const MapAttribution = () => {
    const { baseMapId } = useMapsContext();
    const basemapConfig = BASEMAPS[baseMapId];
    const [open, setOpen] = useState(false);
    const [licenseOpen, setLicenseOpen] = useState(false);

    if (!basemapConfig || basemapConfig.id === 'sin_visor') return null;

    return (
        <div className="fixed bottom-4 right-4 md:bottom-2 md:right-2 z-10 flex items-center gap-2">
            <ReportButton variant="floating" label="Reportar problema o sugerencia" extraContext={{ source: 'map_attribution' }} />
            <div className="hidden md:flex justify-end rounded-2xl bg-[#FFFFFF] px-3 py-1 font-sans font-medium text-xs leading-4 tracking-normal shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] text-[#6E7477] whitespace-nowrap group transition-all duration-300 ease-in-out cursor-default overflow-hidden">
                <span>Contribuciones ©</span>
                <span className="max-w-0 opacity-0 group-hover:max-w-[1000px] group-hover:opacity-100 group-hover:ml-1 transition-all duration-300 ease-in-out inline-flex items-center">
                    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep">OpenStreetMap</a> &nbsp;|&nbsp; © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep ml-1">CARTO</a> &nbsp;|&nbsp; © <a href="https://openlayers.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep ml-1">OpenLayers</a> &nbsp;|&nbsp; © <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep ml-1">Leaflet</a> &nbsp;|&nbsp; © <a href="https://geoserver.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep ml-1">GeoServer</a> &nbsp;|&nbsp; © <a href="https://postgis.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep ml-1">PostGIS</a> &nbsp;|&nbsp; <button type="button" onClick={() => setLicenseOpen(true)} className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 ml-1">Licencia AGPL 3.0</button>
                </span>
            </div>

            <div className="md:hidden relative">
                {open && (
                    <div className="absolute bottom-full right-0 mb-2 rounded-2xl bg-[#FFFFFF] px-3 py-2 font-sans font-medium text-[11px] leading-[18px] text-[#6E7477] whitespace-nowrap shadow-md">
                        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 py-1.5 my-0.5">
                            © OpenStreetMap
                        </a>
                        <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 py-1.5 my-0.5">
                            © CARTO
                        </a>
                        <a href="https://openlayers.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 py-1.5 my-0.5">
                            © OpenLayers
                        </a>
                        <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 py-1.5 my-0.5">
                            © Leaflet
                        </a>
                        <a href="https://geoserver.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 py-1.5 my-0.5">
                            © GeoServer
                        </a>
                        <a href="https://postgis.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 py-1.5 my-0.5">
                            © PostGIS
                        </a>
                        <button
                            type="button"
                            onClick={() => { setLicenseOpen(true); setOpen(false); }}
                            className="text-primary hover:underline hover:text-primary-deep flex items-center gap-1.5 py-1.5 my-0.5 w-full"
                        >
                            Licencia AGPL 3.0
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setOpen(prev => !prev)}
                    className="w-7 h-7 rounded-full bg-[#FFFFFF] flex items-center justify-center font-sans font-medium text-base text-[#6E7477] shadow-sm"
                >
                    ©
                </button>
            </div>

            <LicenseModal isOpen={licenseOpen} onClose={() => setLicenseOpen(false)} />
        </div>
    );
};

export default MapAttribution;
