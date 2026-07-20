import { useState } from 'react';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import { useMapsContext } from '@hooks/useMaps';
import { SCOPE_TYPES } from '@pages/maps/hooks/useMunicipioMode';
import { MAP_Z } from '@constants/mapLayers';

const IS_NON_PROD = ['dev', 'beta'].includes(import.meta.env.VITE_APP_ENV);

const MunicipioActiveChip = () => {
    const { municipioMode } = useMapsContext();
    const { active, scope, scopeLabel, exit, centerOnSelection } = municipioMode || {};
    const [closeHovered, setCloseHovered] = useState(false);

    if (!IS_NON_PROD || !active || !scope?.type) return null;

    const displayLabel = scope.type === SCOPE_TYPES.ZMG ? 'ZMG' : scopeLabel;

    return (
        <div className={`hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 ${MAP_Z.CONTROLS} max-w-[60vw] items-center gap-2`}>
            <Tooltip content={`Click para centrar en ${displayLabel}`} placement="bottom" delay={300}>
                <button
                    type="button"
                    onClick={() => centerOnSelection?.()}
                    className="h-10 flex items-center px-4 rounded-full bg-white shadow-lg border border-slate-100 hover:border-primary transition-all cursor-pointer"
                    aria-label={`Centrar el mapa en ${displayLabel}`}
                >
                    <span className="text-[13px]/[16px] font-sans font-bold text-primary tracking-normal whitespace-nowrap truncate max-w-70">
                        {displayLabel}
                    </span>
                </button>
            </Tooltip>
            <Tooltip content="Salir del modo" placement="bottom" delay={300}>
                <button
                    type="button"
                    onClick={exit}
                    onMouseEnter={() => setCloseHovered(true)}
                    onMouseLeave={() => setCloseHovered(false)}
                    className={[
                        'size-10 flex items-center justify-center rounded-full border border-transparent transition-all cursor-pointer shrink-0',
                        closeHovered ? 'bg-primary' : 'bg-primary-soft hover:border-primary',
                    ].join(' ')}
                    aria-label="Salir del modo Vista por municipio"
                >
                    <Icon name="cerrar" className={`size-7 ${closeHovered ? 'text-white' : 'text-primary'}`} />
                </button>
            </Tooltip>
        </div>
    );
};

export default MunicipioActiveChip;
