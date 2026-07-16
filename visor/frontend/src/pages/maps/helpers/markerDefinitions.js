import visorSquareIcon from '@logos/visor_square.svg';
import { APP_VERSION, APP_LOC } from '@constants/app';
import { BRAND } from '@constants/brand';
import { collectCatalogUnits } from './layers/utils/layerHelpers';

export const computeStats = ({ allLayers = [] } = {}) => {
    const units = collectCatalogUnits({ children: allLayers });
    return {
        totalLayers: units.length,
    };
};

const formatCount = (n) => (typeof n === 'number' ? n.toLocaleString('es-MX') : '—');

export const buildMarker = ({ totalLayers = 0, totalRecords = null } = {}) => ({
    id: 'mapamex_hq',
    center: [-99.13320, 19.43260],
    zoom: 16,
    icon: visorSquareIcon,
    scale: 0.25,
    anchor: [0.5, 0.5],
    minZoom: 15,
    bgColor: BRAND.PRIMARY,
    bgRadius: 45,
    openOnShow: true,
    infoBox: {
        layerName: 'Visor — MapaMex',
        properties: {
            nombre: 'Visor',
            version: `v${APP_VERSION}`,
            institucion: 'MapaMex',
            descripcion: 'Mapa interactivo de México con capas geoespaciales. La herramienta para visualizar y analizar información territorial.',
            direccion: 'Ciudad de México, México',
            telefono: '(55) 0000 0000',
            correo: 'contacto@mapamex.com',
            sitio_web: 'mapamex.com',
            tecnologias: 'React, OpenLayers, FastAPI, GeoServer, PostGIS',
            capas_disponibles: formatCount(totalLayers),
            registros_geograficos: formatCount(totalRecords),
            lineas_codigo: formatCount(APP_LOC)
        },
        littleCard: {
            headerField: 'nombre',
            bodyOrder: ['labels', 'labelGroups', 'list', 'cards', 'iconText', 'text'],
            labelGroups: [
                { fields: ['version'], color: '#ffffff', bg: BRAND.PRIMARY },
                { fields: ['tecnologias'], splitValues: true, color: BRAND.GRAPHITE, bg: '#F1F5F9' }
            ],
            list: [
                { label: 'Organismo', field: 'institucion', raw: true },
                { label: 'Descripción', field: 'descripcion', raw: true }
            ],
            cards: [
                { label: 'Alrededor de capas disponibles', field: 'capas_disponibles' },
                { label: 'Registros geográficos', field: 'registros_geograficos' },
                { label: 'Líneas de código', field: 'lineas_codigo' }
            ],
            cardsColumns: 1,
            iconText: [
                { icon: 'ubicacion', field: 'direccion' },
                { icon: 'celular', field: 'telefono' },
                { icon: 'web', value: 'mapamex.com', href: 'https://mapamex.com/ns/' },
                { icon: 'novedades', value: `Novedades v${APP_VERSION}`, action: 'whats_new' },
                { icon: 'bug', value: 'Reportar problema o sugerencia', action: 'report' }
            ]
        }
    }
});
