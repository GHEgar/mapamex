import { useMapsContext } from '@hooks/useMaps';
import { useSider } from '@contexts/SiderContext';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';

const IS_NON_PROD = ['dev', 'beta'].includes(import.meta.env.VITE_APP_ENV);

const allTools = [
    {
        id: 'mediciones',
        label: 'Mediciones',
        description: 'Punto, linea, poligono',
        icon: 'medicion',
    },
    {
        id: 'compare-swipe',
        label: 'Barra divisora',
        description: 'Swipe vertical',
        beta: true,
        nonProdOnly: true,
        icon: 'tool_swipe',
    },
    {
        id: 'anotaciones',
        label: 'Anotaciones',
        description: 'Texto, emojis, trazo libre',
        icon: 'emoji',
    },
];

const tools = allTools.filter(tool => !tool.nonProdOnly || IS_NON_PROD);

const ToolsMenu = ({ close, closeButton, toggleMeasurementTools, areMeasurementToolsVisible, areAnnotationToolsVisible, toggleAnnotationTools }) => {
    const { compareMode, exitCompareMode, enterCompareMode } = useMapsContext();
    const { closeSider } = useSider();

    const startSwipe = () => {
        enterCompareMode();
        closeSider?.();
    };

    const handleClick = (id) => {
        if (id === 'mediciones') {
            toggleMeasurementTools?.();
        } else if (id === 'anotaciones') {
            toggleAnnotationTools?.();
        } else if (id === 'compare-swipe') {
            if (compareMode?.active) {
                exitCompareMode();
            } else {
                startSwipe();
            }
        }
        close?.();
    };

    const isActive = (id) => {
        if (id === 'mediciones') return !!areMeasurementToolsVisible;
        if (id === 'anotaciones') return !!areAnnotationToolsVisible;
        if (id === 'compare-swipe') return !!compareMode?.active;
        return false;
    };

    return (
        <div className="py-5 px-4">
            <div className="flex items-center justify-between min-h-8 mb-3">
                <h3 className="font-sans font-bold text-[15px]/[20px] text-numeralia tracking-normal">
                    Herramientas
                </h3>
                {closeButton}
            </div>
            <div className="flex flex-col gap-1.5">
                {tools.map(tool => {
                    const active = isActive(tool.id);
                    const tooltipContent = tool.id === 'compare-swipe' ? (
                        <div className="flex flex-col gap-1.5 max-w-60">
                            <span className="font-bold">{tool.label}</span>
                            <span className="text-[11px] opacity-90">Compara dos mapas con barra divisora. Tus capas actuales van al lado A; el lado B empieza <span className="font-bold">vacío</span> para que agregues otra capa.</span>
                            <span className="text-[11px] opacity-90">Agrega capas en cada slot (A o B) <span className="font-bold">una por una</span> para mejor rendimiento.</span>
                        </div>
                    ) : tool.label;
                    return (
                        <Tooltip key={tool.id} content={tooltipContent} placement="right" delay={300} triggerBlock>
                            <button
                                type="button"
                                onClick={() => handleClick(tool.id)}
                                aria-pressed={active}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-colors cursor-pointer text-left ${active ? 'border-primary-deep bg-primary-soft/40' : 'border-transparent hover:bg-slate-100'}`}
                            >
                                <span className={`shrink-0 flex items-center justify-center size-10 rounded-xl ${active ? 'bg-primary-soft text-primary-deep' : 'bg-slate-100 text-graphite'}`}>
                                    <Icon name={tool.icon} className="size-6" />
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-center gap-1.5">
                                        <span className={`text-[13.5px] font-sans font-bold ${active ? 'text-primary' : 'text-numeralia'}`}>
                                            {tool.label}
                                        </span>
                                        {tool.beta && (
                                            <Badge variant="pill" color="orange" text="BETA" />
                                        )}
                                    </span>
                                    <span className="block text-[11px] font-sans text-graphite truncate">
                                        {tool.description}
                                    </span>
                                </span>
                                {active && (
                                    <span className="shrink-0 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-primary-soft text-primary-deep">
                                        Activo
                                    </span>
                                )}
                            </button>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
};

export default ToolsMenu;
