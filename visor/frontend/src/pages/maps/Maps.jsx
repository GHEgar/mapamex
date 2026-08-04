import 'ol/ol.css';
import SEO from '@components/SEO';
import MapView from '@mapsComponents/MapView';
import SwipeView from '@mapsComponents/SwipeView';
import SwipeSlotControls from '@mapsComponents/SwipeSlotControls';
import MapSider from '@mapsComponents/MapSider';
import MunicipioActiveChip from '@mapsComponents/MapExport/MunicipioActiveChip';
import EstadoPill from '@mapsComponents/EstadoPill';
import MapLayersPanels from '@mapsComponents/MapLayersPanels';
import LayerDetailModal from './components/LayerDetailModal/LayerDetailModal';
import InfoBox from './components/InfoBox/InfoBox';
import MapBottomLeftStack from './components/MapBottomLeftStack';
import MeasurementTools from './components/MeasurementTools/ToolsPanel';
import MapAttribution from './components/MapAttribution';
import MapLegend from './components/MapLegend';
import LayerNotices from './components/LayerNotices/LayerNotices';
import { useInitializeFromUrl } from './hooks/useInitializeFromUrl';
import { useSessionPersistence } from './hooks/useSessionPersistence';
import { SiderProvider } from '@contexts/SiderContext';
import { ZenModeProvider } from './components/ZenMode';
import useThemeColor from '@hooks/useThemeColor';
import { useMapsContext } from '@hooks/useMaps';

const Maps = () => {
    useThemeColor('#ffffff');
    useInitializeFromUrl();
    useSessionPersistence();
    const { compareMode } = useMapsContext();
    const isComparing = !!compareMode?.active;

    return (
        <SiderProvider>
            <ZenModeProvider>
                <SEO
                    title="Mapa Interactivo | Visor"
                    description="Mapa interactivo de Jalisco con capas geoespaciales: temperatura, precipitación, recursos naturales, eventos y más. Herramienta oficial del MapaMex para consulta y análisis territorial."
                    schemaType="WebApplication"
                    keywords="mapa interactivo Jalisco, capas geoespaciales Jalisco, mapa temperatura Jalisco, mapa precipitación Jalisco, mapa recursos naturales Jalisco, MapaMex, GeoServer Jalisco"
                />
                <h1 className="sr-only">Mapa interactivo de Jalisco con capas geoespaciales — Visor MapaMex</h1>
                <p className="sr-only">
                    Herramienta oficial del Instituto de Información Estadística y Geográfica de Jalisco (MapaMex) para visualizar el mapa de Jalisco con capas temáticas: temperatura, precipitación, recursos naturales, eventos, infraestructura y datos estadísticos del estado.
                </p>
                <div className="relative w-full h-dvh">
                    <MapSider />
                    <EstadoPill />
                    <MunicipioActiveChip />
                    <MapLayersPanels />
                    <LayerDetailModal />
                    <InfoBox />
                    <MapAttribution />
                    <MapLegend />
                    <MapBottomLeftStack />
                    {!isComparing && <MeasurementTools />}
                    {isComparing ? <SwipeView /> : <MapView />}
                    {isComparing && <SwipeSlotControls />}
                    <LayerNotices />
                </div>
            </ZenModeProvider>
        </SiderProvider>
    );
};

export default Maps;

