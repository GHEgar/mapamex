import { Outlet } from 'react-router';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import esES from 'antd/locale/es_ES';
import { BRAND } from '@app/providers/brand';
import MessageBridge from '@app/MessageBridge';

const THEME = {
    algorithm: theme.defaultAlgorithm,
    token: {
        colorPrimary: BRAND.primary,
        colorLink: BRAND.primary,
        colorInfo: BRAND.primary,
        colorWarning: BRAND.secondary,
        colorError: '#d4380d',
        borderRadius: 8,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: 14
    },
    components: {
        Layout: {
            headerBg: '#ffffff',
            siderBg: BRAND.numeralia,
            triggerBg: '#0F172A'
        },
        Menu: {
            darkItemBg: BRAND.numeralia,
            darkItemSelectedBg: BRAND.primary,
            darkSubMenuItemBg: '#0F172A'
        },
        Button: {
            primaryShadow: 'none'
        },
        Card: {
            boxShadowTertiary: '0 1px 2px rgba(0,0,0,0.04)'
        }
    }
};

export default function MainProvider() {
    return (
        <ConfigProvider locale={esES} theme={THEME}>
            <AntApp style={{ minHeight: '100dvh' }}>
                <MessageBridge />
                <Outlet />
            </AntApp>
        </ConfigProvider>
    );
}
