import {
    Anchor,
    ArrowLeftRight,
    Bike,
    Bug,
    ChartLine,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronsLeftRight,
    ChevronsUpDown,
    CircleAlert,
    CircleDot,
    CircleOff,
    CirclePause,
    ClockAlert,
    Columns2,
    Compass,
    Contrast,
    Copy,
    Crosshair,
    Download,
    EllipsisVertical,
    Eye,
    EyeOff,
    Flame,
    Footprints,
    Gauge,
    Globe,
    GraduationCap,
    GripVertical,
    HandHeart,
    HeartPulse,
    Info,
    Landmark,
    Layers,
    Layers3,
    Leaf,
    List,
    LocateFixed,
    Map,
    MapPin,
    MapPinned,
    Mars,
    Maximize,
    Minus,
    Moon,
    Mountain,
    MountainSnow,
    Move,
    Orbit,
    PanelLeftClose,
    PanelLeftOpen,
    Pause,
    Pencil,
    Pentagon,
    Pin,
    Play,
    Plus,
    Ruler,
    Rows2,
    Satellite,
    Search,
    Settings,
    Shapes,
    Share2,
    Shield,
    Smartphone,
    Smile,
    Snowflake,
    Sparkles,
    Spline,
    SquareDashed,
    Sun,
    TrafficCone,
    TrainFront,
    Trash2,
    Trees,
    TriangleAlert,
    Type,
    Undo2,
    Users,
    Venus,
    Wrench,
    X,
} from 'lucide-react';
import Tooltip from '@components/Tooltip';

const STATE_COLOR = {
    hover: 'text-primary',
    active: 'text-primary',
    gray: 'text-slate-300',
};

const icons = {
    download: Download,
    undo: Undo2,
    close: X,
    done: Check,
    pencil: Pencil,
    text: Type,
    alert_triangle: TriangleAlert,
    bug: Bug,
    tool_swipe: Columns2,
    pin_fallback: MapPin,
    pause_all: CirclePause,
    swipe_handle_chevrons_h: ChevronsUpDown,
    swipe_handle_chevrons_v: ChevronsLeftRight,
    swipe_orientacion: ArrowLeftRight,
    center_group: SquareDashed,
    move_arrows: Move,
    settings: Settings,
    opacity: Contrast,
    cerrar: X,
    cerrarModal: X,
    downArrow: ChevronDown,
    upArrow: ChevronUp,
    down_arrow_fill: ChevronDown,
    left_arrow_fill: ChevronLeft,
    right_arrow_fill: ChevronRight,
    zoomin: Plus,
    zoomout: Minus,
    searchInput: Search,
    searchLayer: Search,
    visible: { c: Eye, states: { hover: EyeOff }, colors: { normal: 'text-primary', hover: 'text-graphite' } },
    hide: EyeOff,
    eliminar: Trash2,
    copie: Copy,
    shared: Share2,
    shared_click: Share2,
    move: Move,
    drag: GripVertical,
    opciones: EllipsisVertical,
    deshacer: Undo2,
    info: Info,
    info_warning: { c: Info, colors: { normal: 'text-secondary' } },
    alert: { c: TriangleAlert, colors: { normal: 'text-secondary' } },
    warning_dropdown: { c: CircleAlert, colors: { normal: 'text-secondary' } },
    check: Check,
    center: LocateFixed,
    fit_extent: Maximize,
    lista: List,
    emoji: Smile,
    web: Globe,
    ubicacion: MapPin,
    simbologia: { c: Shapes, colors: { normal: 'text-primary' } },
    capa_activa: Layers3,
    coordenadas: Crosshair,
    play: Play,
    pause: Pause,
    linea: Spline,
    poligono: Pentagon,
    punto: CircleDot,
    medicion: Ruler,
    big_card: Rows2,
    novedades: Sparkles,
    celular: Smartphone,
    mode_auto: PanelLeftOpen,
    mode_fijo: Pin,
    mode_iconos: PanelLeftClose,
    mode_zen: Leaf,
    rendimiento: Gauge,
    tiempo_alert: ClockAlert,
    base_layers: { c: Layers, colors: { normal: 'text-graphite' } },
    layers: { c: Layers, colors: { normal: 'text-graphite' } },
    general: { c: Layers, colors: { normal: 'text-graphite' } },
    'san-luis-potosi': { c: MapPinned, colors: { normal: 'text-graphite' } },
    estado: { c: MapPinned, colors: { normal: 'text-graphite' } },
    demografia: { c: Users, colors: { normal: 'text-graphite' } },
    salud: { c: HeartPulse, colors: { normal: 'text-graphite' } },
    economia: { c: ChartLine, colors: { normal: 'text-graphite' } },
    educacion: { c: GraduationCap, colors: { normal: 'text-graphite' } },
    recursos: { c: Trees, colors: { normal: 'text-graphite' } },
    'recursos-y-calidad-de-vida': { c: Trees, colors: { normal: 'text-graphite' } },
    desarrollo: { c: HandHeart, colors: { normal: 'text-graphite' } },
    seguridad: { c: Shield, colors: { normal: 'text-graphite' } },
    gobierno: { c: Landmark, colors: { normal: 'text-graphite' } },
    search: { c: Search, colors: { normal: 'text-graphite' } },
    tools: { c: Wrench, colors: { normal: 'text-graphite' } },
    basemaps: { c: Map, colors: { normal: 'text-graphite' } },
    sin_visor: { c: CircleOff, colors: { normal: 'text-graphite' } },
    satelite: { c: Satellite, colors: { normal: 'text-graphite' } },
    position: { c: Map, colors: { normal: 'text-graphite' } },
    voyager: { c: Compass, colors: { normal: 'text-graphite' } },
    osm: { c: Map, colors: { normal: 'text-graphite' } },
    carto_positron: { c: Sun, colors: { normal: 'text-graphite' } },
    carto_dark_matter: { c: Moon, colors: { normal: 'text-graphite' } },
    esri_world_imagery: { c: Satellite, colors: { normal: 'text-graphite' } },
    esri_world_topo: { c: Mountain, colors: { normal: 'text-graphite' } },
    opentopomap: { c: MountainSnow, colors: { normal: 'text-graphite' } },
    openseamap: { c: Anchor, colors: { normal: 'text-graphite' } },
    openrailwaymap: { c: TrainFront, colors: { normal: 'text-graphite' } },
    waymarked_trails: { c: Footprints, colors: { normal: 'text-graphite' } },
    opensnowmap: { c: Snowflake, colors: { normal: 'text-graphite' } },
    cyclosm: { c: Bike, colors: { normal: 'text-graphite' } },
    strava_heatmap: { c: Flame, colors: { normal: 'text-graphite' } },
    nasa_gibs: { c: Orbit, colors: { normal: 'text-graphite' } },
    waze: { c: TrafficCone, colors: { normal: 'text-graphite' } },
    hombre: { c: Mars, colors: { normal: 'text-graphite' } },
    mujer: { c: Venus, colors: { normal: 'text-graphite' } },
    raster: { c: Satellite, colors: { normal: 'text-graphite' } },
    mundial: { c: Globe, colors: { normal: 'text-graphite' } },
};

const Icon = ({ name, fallback = null, className = '', classNameBG = '', state = 'normal', visible = true, tooltip = null, onClick = null }) => {
    if (!visible) return null;

    const positioningClasses = ['absolute', 'fixed', 'relative', 'sticky', 'top-', 'bottom-', 'left-', 'right-', 'inset-', 'z-'];
    const classNames = className.split(' ');
    const wrapperClasses = [];
    const iconClasses = [];

    classNames.forEach(cls => {
        if (positioningClasses.some(pos => cls.startsWith(pos))) {
            wrapperClasses.push(cls);
        } else {
            iconClasses.push(cls);
        }
    });

    let iconElement = null;
    const iconClassName = iconClasses.join(' ');

    const entry = icons[name] || (fallback ? icons[fallback] : null);

    if (entry) {
        const IconComponent = entry.states?.[state] || entry.c || entry;
        const hasTextColor = /(?:^|\s)text-/.test(iconClassName);
        const hasSize = /(?:^|\s)(?:w-|h-|size-)/.test(iconClassName);
        const colorClass = hasTextColor ? '' : (entry.colors?.[state] || (state !== 'normal' ? STATE_COLOR[state] : '') || '');
        const finalClassName = [iconClassName, hasSize ? '' : 'w-5 h-5', colorClass].filter(Boolean).join(' ');
        iconElement = <IconComponent className={finalClassName} />;
    }

    if (!iconElement) return null;

    const needsWrapper = onClick || tooltip || wrapperClasses.length > 0 || classNameBG;

    if (needsWrapper) {
        const finalWrapperClasses = [
            ...wrapperClasses,
            classNameBG,
            onClick ? 'cursor-pointer' : ''
        ].filter(Boolean).join(' ');

        const content = tooltip ? <Tooltip content={tooltip}>{iconElement}</Tooltip> : iconElement;
        iconElement = onClick ? (
            <button type="button" onClick={onClick} className={finalWrapperClasses || undefined}>
                {content}
            </button>
        ) : (
            <span className={finalWrapperClasses || undefined}>
                {content}
            </span>
        );
        return iconElement;
    }

    return iconElement;
};

export default Icon;
