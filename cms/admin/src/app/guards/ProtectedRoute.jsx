import { Navigate } from 'react-router';
import { Spin, Result, Button } from 'antd';
import { useAuth } from '@shared/contexts/useAuth';

const STAFF_ROLES = ['tetlamamakani', 'editora'];

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading, user, logout } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <Spin size="large" tip="Cargando...">
                    <div style={{ padding: 50 }} />
                </Spin>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (user && !STAFF_ROLES.includes(user.role)) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
            }}>
                <Result
                    status="403"
                    title="Acceso restringido"
                    subTitle="El panel administrativo es solo para staff del MapaMex."
                    extra={[
                        <Button key="logout" onClick={async () => { await logout(); }}>
                            Cerrar sesion
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return children;
}
