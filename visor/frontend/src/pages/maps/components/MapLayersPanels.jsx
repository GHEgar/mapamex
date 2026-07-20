import { useState, useCallback } from 'react';
import { ActiveLayersList } from './ActiveLayers';
import SymbologyPanel from './SymbologyPanel';
import Panel from '@components/Panel';
import Message from '@components/Message';
import { useSlowLoading } from '@hooks/useSlowLoading';
import { MAP_Z, MAP_Z_MOBILE } from '@constants/mapLayers';

const SYMBOLOGY_PANEL_ENABLED = false;

const MapLayersPanels = () => {
    const [layersCollapsed, setLayersCollapsed] = useState(true);
    const [symbologyCollapsed, setSymbologyCollapsed] = useState(true);
    const [actionsOpen, setActionsOpen] = useState(false);
    const handleLayersCollapse = useCallback((v) => setLayersCollapsed(v), []);
    const handleSymbologyCollapse = useCallback((v) => setSymbologyCollapsed(v), []);
    const isSlow = useSlowLoading(5000);

    const allCollapsed = layersCollapsed && (!SYMBOLOGY_PANEL_ENABLED || symbologyCollapsed);
    const actionsPanelOpen = actionsOpen;

    return (
        <Panel
            variant="floating"
            position={`top-4 right-4 ${allCollapsed ? '' : 'max-md:top-27'} ${actionsPanelOpen ? MAP_Z.PANELS : MAP_Z.BASE} ${actionsPanelOpen ? MAP_Z_MOBILE.MODALS : (allCollapsed ? 'max-md:z-9' : 'max-md:z-[23]')}`}
            width="w-[373px] max-md:w-[calc(100vw-2rem)]"
            maxHeight="max-h-[calc(100vh-4rem)] max-md:max-h-[calc(100dvh-10rem)]"
            flexDirection="flex-col"
            contentClassName="gap-4 overflow-visible"
            noPadding={true}
            className="bg-transparent! border-transparent! shadow-none! overflow-visible max-md:pointer-events-none"
        >
            {isSlow && (
                <div className="max-md:pointer-events-auto">
                    <Message
                        variant="warning"
                        title="Recuerda que..."
                        description="El funcionamiento del mapa puede verse afectado de acuerdo al número de capas que tengas activas."
                        closable
                        storageKey="slow_loading_warning"
                        size="compact"
                    />
                </div>
            )}
            <ActiveLayersList onCollapseChange={handleLayersCollapse} onActionsOpenChange={setActionsOpen} />
            {SYMBOLOGY_PANEL_ENABLED && <SymbologyPanel onCollapseChange={handleSymbologyCollapse} />}
        </Panel>
    );
};

export default MapLayersPanels;
