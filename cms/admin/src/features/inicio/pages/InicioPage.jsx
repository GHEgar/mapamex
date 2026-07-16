import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Layout, Card, Typography, Space, Tag, Table, Button, Empty, Spin, Alert } from 'antd';
import {
    AuditOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useAuth } from '@shared/contexts/useAuth';
import {
    getMisBorradores,
    getBorradoresPendientes,
} from '@features/inicio/api/inicioService';
import { VisorInicioHighlights } from '@features/visor-stats';

const { Content } = Layout;
const { Title, Text } = Typography;

const ESTADO_TAG = {
    en_progreso: { color: 'blue', label: 'En progreso' },
    pendiente_revision: { color: 'gold', label: 'En revisión' },
    rechazado: { color: 'red', label: 'Rechazado' },
};

const tipoLabel = (resource_type) => ({
    'evento': 'Evento',
    'home_section': 'Inicio',
}[resource_type] || resource_type);

const editPath = (record) => {
    if (record.resource_type === 'evento') return `/visor/eventos/${record.resource_id}/edit`;
    if (record.resource_type === 'home_section') return '/visor/home';
    return `/visor/eventos/${record.resource_id}/edit`;
};

const tituloRecurso = (record) => {
    if (record.resource_type === 'home_section') return record.resource_id;
    return record.data?.titulo || record.data?.title || record.resource_id;
};



export default function InicioPage() {
    const { user } = useAuth();
    const [misBorradores, setMisBorradores] = useState([]);
    const [pendientes, setPendientes] = useState([]);
    const [loadingBorradores, setLoadingBorradores] = useState(true);
    const isAdmin = user?.role === 'tetlamamakani';

    useEffect(() => {
        let cancelled = false;
        const tasks = [getMisBorradores()];
        if (isAdmin) tasks.push(getBorradoresPendientes());

        Promise.all(tasks)
            .then(([mios, pend]) => {
                if (cancelled) return;
                setMisBorradores(mios);
                if (pend) setPendientes(pend);
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoadingBorradores(false); });

        return () => { cancelled = true; };
    }, [isAdmin]);

    const rechazados = useMemo(
        () => misBorradores.filter((b) => b.estado === 'rechazado'),
        [misBorradores],
    );

    const columnsBorradores = [
        {
            title: 'Tipo',
            key: 'tipo',
            width: 120,
            render: (_, r) => <Tag>{tipoLabel(r.resource_type)}</Tag>,
        },
        {
            title: 'Recurso',
            key: 'titulo',
            render: (_, r) => <Text>{tituloRecurso(r)}</Text>,
        },
        {
            title: 'Estado',
            key: 'estado',
            width: 140,
            render: (_, r) => {
                const cfg = ESTADO_TAG[r.estado] || { color: 'default', label: r.estado };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            },
        },
        {
            title: 'Última edición',
            dataIndex: 'actualizado_en',
            key: 'actualizado_en',
            width: 180,
            render: (d) => d ? new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—',
        },
        {
            key: 'acciones',
            width: 80,
            render: (_, r) => (
                <Link to={editPath(r)}>
                    <Button type="link" icon={<EditOutlined />} size="small">Continuar</Button>
                </Link>
            ),
        },
    ];

    return (
        <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        Hola, {user?.name || 'editor'}
                    </Title>
                    <Text type="secondary">Bienvenida a Cms · {user?.role}</Text>
                </div>

                {rechazados.length > 0 && (
                    <Alert closable
                        type="error"
                        showIcon
                        message={`Tienes ${rechazados.length} borrador${rechazados.length === 1 ? '' : 'es'} rechazado${rechazados.length === 1 ? '' : 's'}`}
                        description="Revísalos y aplícales los cambios solicitados antes de volver a enviar a revisión."
                    />
                )}

                {isAdmin && pendientes.length > 0 && (
                    <Card size="small">
                        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                            <Space>
                                <AuditOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                                <div>
                                    <Text strong>{pendientes.length} borrador{pendientes.length === 1 ? '' : 'es'} esperando tu revisión</Text>
                                    <br />
                                    <Text type="secondary">Aprueba o rechaza los cambios enviados por las editoras.</Text>
                                </div>
                            </Space>
                            <Link to="/revision">
                                <Button type="primary">Revisar ahora</Button>
                            </Link>
                        </Space>
                    </Card>
                )}

                <Card title="Mis borradores" size="small">
                    {loadingBorradores ? (
                        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
                    ) : misBorradores.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <Space orientation="vertical" size={4}>
                                    <Text>No tienes borradores en progreso</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Empieza por <Link to="/visor/home">editar el Inicio</Link> o <Link to="/visor/eventos">crear un evento</Link>.
                                    </Text>
                                </Space>
                            }
                        />
                    ) : (
                        <Table
                            columns={columnsBorradores}
                            dataSource={misBorradores}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            scroll={{ x: 'max-content' }}
                        />
                    )}
                </Card>

                <VisorInicioHighlights />
            </Space>
        </Content>
    );
}
