import { useState } from 'react';
import { useMapsContext } from '@hooks/useMaps';
import { BASEMAPS } from '@pages/maps/helpers/basemaps';
import ReportButton from '@components/ReportButton';
import LicenseModal from '@pages/maps/components/LicenseModal';

const linkClass = 'hover:text-primary hover:underline transition-colors';

const MapAttribution = () => {
    const { baseMapId } = useMapsContext();
    const basemapConfig = BASEMAPS[baseMapId];
    const [licenseOpen, setLicenseOpen] = useState(false);

    if (!basemapConfig || basemapConfig.id === 'sin_visor') return null;

    return (
        <div className="fixed bottom-14 right-4 md:bottom-2 md:right-2 z-10 flex items-center gap-2">
            <ReportButton variant="floating" label="Reportar problema o sugerencia" extraContext={{ source: 'map_attribution' }} />
            <p className="font-sans font-medium text-[10px]/[14px] md:text-[12px]/[16px] text-graphite [text-shadow:0_1px_2px_rgba(255,255,255,0.9)] select-none whitespace-nowrap">
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className={linkClass}>OpenStreetMap</a>
                {' · '}
                <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className={linkClass}>CARTO</a>
                {' · '}
                <button type="button" onClick={() => setLicenseOpen(true)} className={`${linkClass} cursor-pointer`}>AGPL-3.0</button>
            </p>

            <LicenseModal isOpen={licenseOpen} onClose={() => setLicenseOpen(false)} />
        </div>
    );
};

export default MapAttribution;
