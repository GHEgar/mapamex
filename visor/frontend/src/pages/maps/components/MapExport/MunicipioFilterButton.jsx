import { useRef, useState } from 'react';
import Panel from '@components/Panel';
import Tooltip from '@components/Tooltip';
import Icon from '@components/Icon';
import { useSider } from '@contexts/SiderContext';
import { trackMunicipioPanelOpen } from '@services/analyticsService';
import { SCOPE_TYPES } from '@pages/maps/hooks/useMunicipioMode';
import MunicipioFilterPanel from './MunicipioFilterPanel';

const scopeText = (municipioMode) => {
    const { active, scope, scopeLabel } = municipioMode;
    if (!active || !scope?.type) return null;
    if (scope.type === SCOPE_TYPES.ZMG) return 'ZMG';
    if (scope.type === SCOPE_TYPES.REGION) return scope.value || 'Región';
    return scopeLabel || null;
};

const buildLabel = (municipioMode) => scopeText(municipioMode) || 'Ámbito';

const buildShort = (municipioMode) => {
    const text = scopeText(municipioMode);
    if (!text) return null;
    if (text === 'ZMG') return 'ZMG';
    return text.slice(0, 3).toUpperCase();
};

const MunicipioFilterButton = ({ municipioMode, onOpenChange, collapsed = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const anchorRef = useRef(null);
    const { isMobile } = useSider();

    if (!municipioMode) return null;

    const handleSetOpen = (open) => {
        setIsOpen(open);
        onOpenChange?.(open);
        if (open) {
            trackMunicipioPanelOpen({ active: municipioMode.active });
        }
    };

    const label = buildLabel(municipioMode);
    const shortText = buildShort(municipioMode);
    const isActive = !!municipioMode.scope?.type && municipioMode.active;
    const showLabel = !isMobile && !collapsed;

    return (
        <div className={`flex flex-col relative ${showLabel ? 'flex-1 min-w-0' : ''}`}>
            <Tooltip content="Vista por municipio" placement="top" delay={300}>
                <button
                    ref={anchorRef}
                    type="button"
                    onClick={() => handleSetOpen(!isOpen)}
                    className={[
                        'flex items-center justify-center relative',
                        showLabel ? 'w-full px-3' : 'w-12.5',
                        'h-12.5 rounded-full transition',
                        'bg-white hover:bg-slate-100 text-primary',
                        'font-sans font-bold text-[13px] hover:shadow-lg',
                        isActive ? 'ring ring-primary' : '',
                    ].join(' ')}
                    aria-label="Vista por municipio"
                >
                    {showLabel ? (
                        <span className="truncate w-full text-center">{label}</span>
                    ) : shortText ? (
                        <span className="text-[10px] font-bold">{shortText}</span>
                    ) : (
                        <Icon name="center_group" className="size-6 text-primary" />
                    )}
                </button>
            </Tooltip>

            <Panel
                open={isOpen}
                anchorRef={anchorRef}
                onClose={() => handleSetOpen(false)}
                variant="solid"
                width="w-80"
                maxHeight="max-h-[32rem] max-md:max-h-[calc(100dvh-6rem)]"
                className="z-50 mt-4 shadow-none border-none rounded-2xl"
                placement="bottom-end"
                mobileFullscreen={false}
                hideHeader
                noPadding
                bg="bg-transparent"
            >
                <MunicipioFilterPanel municipioMode={municipioMode} />
            </Panel>
        </div>
    );
};

export default MunicipioFilterButton;
