import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import { fetchShare } from '@services/shareService';
import { useShareDeserializer } from '@pages/maps/hooks/useShareDeserializer';
import { trackShareMap } from '@services/analyticsService';

const ShareActiveChip = ({ loadedShareId, onMarkPending }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const deserialize = useShareDeserializer();
    const [closeHovered, setCloseHovered] = useState(false);
    const [reapplying, setReapplying] = useState(false);

    const handleClearShare = useCallback(() => {
        const next = new URLSearchParams(searchParams);
        next.delete('s');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const handleReapplyShare = useCallback(async () => {
        if (!loadedShareId || reapplying) return;
        setReapplying(true);
        try {
            const envelope = await fetchShare(loadedShareId);
            if (envelope) {
                onMarkPending?.();
                deserialize(envelope);
                trackShareMap('share_reapply');
            }
        } catch {
        } finally {
            setReapplying(false);
        }
    }, [loadedShareId, reapplying, deserialize, onMarkPending]);

    return (
        <div className="hidden md:flex items-center gap-1.5 mr-2">
            <Tooltip content="Click para recargar la configuración original del compartido" placement="bottom" delay={300}>
                <button
                    type="button"
                    onClick={handleReapplyShare}
                    className={[
                        'h-9 flex items-center px-3 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#22C55E] shadow-lg text-[11px]/[16px] font-sans whitespace-nowrap cursor-pointer transition-all hover:bg-[#BBF7D0]',
                        reapplying ? 'opacity-60 cursor-wait' : '',
                    ].join(' ')}
                    aria-label="Recargar configuración del compartido"
                    aria-busy={reapplying}
                >
                    Compartido: <span className="font-bold tabular-nums ml-1">{loadedShareId}</span>
                </button>
            </Tooltip>
            <Tooltip content="Quitar el enlace compartido" placement="bottom" delay={300}>
                <button
                    type="button"
                    onClick={handleClearShare}
                    onMouseEnter={() => setCloseHovered(true)}
                    onMouseLeave={() => setCloseHovered(false)}
                    className={[
                        'size-9 flex items-center justify-center rounded-full border border-transparent transition-all cursor-pointer shrink-0 shadow-lg',
                        closeHovered ? 'bg-primary' : 'bg-primary-soft hover:border-primary',
                    ].join(' ')}
                    aria-label="Quitar enlace compartido"
                >
                    <Icon name="cerrar" className={`size-5 ${closeHovered ? 'text-white' : 'text-primary'}`} />
                </button>
            </Tooltip>
        </div>
    );
};

export default ShareActiveChip;
