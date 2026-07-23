import { useMapsContext } from '@hooks/useMaps';
import ReportButton from '@components/ReportButton';
import { MAP_Z } from '@constants/mapLayers';

const linkClass = 'hover:text-primary hover:underline transition-colors';

const MapAttribution = () => {
    const { baseMapId, basemaps } = useMapsContext();
    const basemapConfig = basemaps?.[baseMapId];
    if (!basemapConfig || basemapConfig.type === 'none') return null;

    return (
        <div className={`fixed bottom-4 right-4 ${MAP_Z.BASE} flex items-center gap-2`}>
            <ReportButton variant="floating" label="Reportar problema o sugerencia" extraContext={{ source: 'map_attribution' }} />
            <p className="font-sans font-medium text-[10px]/[14px] md:text-[12px]/[16px] text-graphite [text-shadow:0_1px_2px_rgba(255,255,255,0.9)] select-none whitespace-nowrap">
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className={linkClass}>OpenStreetMap</a>
                {' · '}
                <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className={linkClass}>CARTO</a>
            </p>
        </div>
    );
};

export default MapAttribution;
