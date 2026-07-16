import {
    AppstoreOutlined,
    BarChartOutlined,
    BookOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    HomeOutlined,
    InboxOutlined,
    KeyOutlined,
    OrderedListOutlined,
    PartitionOutlined,
} from '@ant-design/icons';

export const PROJECT_REGISTRY = {
    visor: {
        label: 'Visor',
        icon: <EnvironmentOutlined />,
        items: [
            { key: '/visor/layers', path: '/visor/layers', label: 'Capas', icon: <PartitionOutlined /> },
            {
                key: '/visor/layers/ingesta-masiva', path: '/visor/layers/ingesta-masiva',
                label: 'Ingesta masiva', icon: <InboxOutlined />, showBetaBadge: true,
            },
            { key: '/visor/initial-order', path: '/visor/initial-order', label: 'Capas iniciales', icon: <OrderedListOutlined /> },
            { key: '/visor/eventos', path: '/visor/eventos', label: 'Eventos', icon: <CalendarOutlined /> },
            { key: '/visor/home', path: '/visor/home', label: 'Inicio', icon: <HomeOutlined /> },
            {
                key: '/visor/simbolos', path: '/visor/simbolos', label: 'Símbolos',
                icon: <AppstoreOutlined />, allowedGlobalRoles: ['tetlamamakani'], showBetaBadge: true,
            },
            {
                key: '/visor/recursos-geoserver', path: '/visor/recursos-geoserver', label: 'Recursos GeoServer',
                icon: <FileTextOutlined />, showBetaBadge: true,
            },
            {
                key: '/visor/api-keys', path: '/visor/api-keys', label: 'API Keys',
                icon: <KeyOutlined />, allowedGlobalRoles: ['tetlamamakani'], showBetaBadge: true,
            },
            {
                key: '/visor/stats', path: '/visor/stats', label: 'Estadísticas',
                icon: <BarChartOutlined />,
            },
        ],
    },
};

export const FOOTER_ITEMS = [
    {
        key: '/documentacion',
        path: '/documentacion',
        label: 'Documentación',
        icon: <BookOutlined />,
        allowedGlobalRoles: ['tetlamamakani', 'editora'],
    },
];
