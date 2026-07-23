import { useState } from 'react';
import { Alert, Button, Card, Layout, Popconfirm, Space, Spin, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useBasemaps } from '@features/visor-basemaps/hooks/useBasemaps';
import { deleteBasemap } from '@features/visor-basemaps/api/basemapsService';
import BasemapFormModal from '@features/visor-basemaps/components/BasemapFormModal';
import useIsMobile from '@shared/hooks/useIsMobile';
import { message } from '@shared/services/message';

const { Content } = Layout;
const { Title, Text } = Typography;

const TYPE_LABEL = { xyz: 'XYZ', wms: 'WMS', none: 'Ninguno' };


export default function BasemapsListPage() {
    const { items, loading, error, reload } = useBasemaps();
    const { isMobile } = useIsMobile();
    const [editing, setEditing] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const openNew = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (record) => { setEditing(record); setModalOpen(true); };

    const handleDelete = async (record) => {
        setDeletingId(record.id);
        try {
            await deleteBasemap(record.id);
            message.success(`Mapa base "${record.label}" eliminado`);
            await reload();
        } catch (err) {
            message.error(err?.response?.data?.detail || 'Error al eliminar');
        } finally {
            setDeletingId(null);
        }
    };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'label',
            key: 'label',
            render: (label, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{label}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{record.slug}</Text>
                </Space>
            ),
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (t) => <Tag>{TYPE_LABEL[t] || t}</Tag>,
        },
        {
            title: 'Estado',
            dataIndex: 'activo',
            key: 'activo',
            width: 100,
            align: 'center',
            render: (activo) => <Tag color={activo ? 'green' : 'default'}>{activo ? 'Activo' : 'Inactivo'}</Tag>,
        },
        {
            title: 'Orden',
            dataIndex: 'orden',
            key: 'orden',
            width: 70,
            align: 'center',
            responsive: ['sm'],
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: isMobile ? 90 : 170,
            render: (_, record) => (
                <Space size={4} wrap>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                        {!isMobile && 'Editar'}
                    </Button>
                    <Popconfirm
                        title="Eliminar mapa base"
                        description={`¿Eliminar "${record.label}"?`}
                        okText="Eliminar"
                        cancelText="Cancelar"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} loading={deletingId === record.id} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Content style={{ padding: isMobile ? 6 : 24, width: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={isMobile ? 4 : 3} style={{ marginBottom: 4 }}>Mapas base</Title>
                    <Text type="secondary">
                        Mapas base que el visor ofrece en su selector. El slug es el identificador estable
                        (baseMapId); cambiarlo rompe sesiones y enlaces guardados.
                    </Text>
                </div>

                {error && <Alert type="error" message={error} showIcon closable />}

                <Card
                    title={`${items.length} mapa${items.length === 1 ? '' : 's'} base`}
                    extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
                            Nuevo mapa base
                        </Button>
                    }
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={items}
                            pagination={false}
                            size={isMobile ? 'small' : 'middle'}
                            scroll={{ x: 'max-content' }}
                        />
                    )}
                </Card>
            </Space>

            <BasemapFormModal
                open={modalOpen}
                basemap={editing}
                onClose={() => setModalOpen(false)}
                onSaved={reload}
            />
        </Content>
    );
}
