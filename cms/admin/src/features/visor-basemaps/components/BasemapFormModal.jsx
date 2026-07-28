import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { createBasemap, updateBasemap } from '@features/visor-basemaps/api/basemapsService';
import { message } from '@shared/services/message';

const TYPE_OPTIONS = [
    { label: 'XYZ (tiles)', value: 'xyz' },
    { label: 'WMS', value: 'wms' },
    { label: 'Ninguno (sin mapa base)', value: 'none' },
];

function slugify(value) {
    return (value || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}

export default function BasemapFormModal({ open, basemap, onClose, onSaved }) {
    const [form] = Form.useForm();
    const isEdit = Boolean(basemap?.id);
    const type = Form.useWatch('type', form);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                slug: basemap?.slug || '',
                label: basemap?.label || '',
                type: basemap?.type || 'xyz',
                url: basemap?.url || '',
                attributions: basemap?.attributions || '',
                subdomains: basemap?.subdomains || [],
                labelsUrl: basemap?.labelsUrl || '',
                labelZoomThreshold: basemap?.labelZoomThreshold ?? null,
                maxZoom: basemap?.maxZoom ?? null,
                wmsParams: basemap?.wmsParams ? JSON.stringify(basemap.wmsParams, null, 2) : '',
                thumbnailUrl: basemap?.thumbnailUrl || '',
                orden: basemap?.orden ?? 0,
                activo: basemap?.activo ?? true,
            });
        }
    }, [open, basemap, form]);

    const handleLabelBlur = () => {
        const slug = form.getFieldValue('slug');
        const label = form.getFieldValue('label');
        if (!slug && label) form.setFieldValue('slug', slugify(label));
    };

    const handleOk = async () => {
        let values;
        try {
            values = await form.validateFields();
        } catch (err) {
            if (err?.errorFields) return;
            throw err;
        }

        const isXyz = values.type === 'xyz';
        let wmsParams = null;
        if (values.type === 'wms' && values.wmsParams?.trim()) {
            try {
                wmsParams = JSON.parse(values.wmsParams);
            } catch {
                message.error('Parámetros WMS: JSON no válido');
                return;
            }
        }

        const payload = {
            slug: values.slug,
            label: values.label,
            type: values.type,
            url: values.type === 'none' ? null : (values.url || null),
            attributions: values.attributions || null,
            subdomains: isXyz && values.subdomains?.length ? values.subdomains : null,
            labelsUrl: isXyz ? (values.labelsUrl || null) : null,
            labelZoomThreshold: isXyz ? (values.labelZoomThreshold ?? null) : null,
            maxZoom: isXyz ? (values.maxZoom ?? null) : null,
            wmsParams,
            thumbnailUrl: values.thumbnailUrl || null,
            orden: values.orden ?? 0,
            activo: values.activo,
        };

        try {
            if (isEdit) {
                await updateBasemap(basemap.id, payload);
                message.success('Mapa base actualizado');
            } else {
                await createBasemap(payload);
                message.success('Mapa base creado');
            }
            form.resetFields();
            onSaved?.();
            onClose?.();
        } catch (err) {
            message.error(err?.response?.data?.detail || 'Error al guardar mapa base');
        }
    };

    return (
        <Modal
            open={open}
            title={isEdit ? `Editar mapa base: ${basemap.label}` : 'Nuevo mapa base'}
            onCancel={onClose}
            onOk={handleOk}
            okText={isEdit ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            width={640}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="label"
                    label="Nombre visible"
                    rules={[{ required: true, message: 'Requerido' }]}
                >
                    <Input onBlur={handleLabelBlur} placeholder="Ej. Mapa Carto Voyager" maxLength={120} />
                </Form.Item>
                <Form.Item
                    name="slug"
                    label="Slug (identificador estable)"
                    extra={isEdit ? 'No editable: el visor lo persiste en sesiones y enlaces guardados.' : 'Se usa como baseMapId en el visor; no lo cambies después.'}
                    rules={[
                        { required: true, message: 'Requerido' },
                        { pattern: /^[a-z0-9_-]+$/, message: 'Solo minúsculas, números, guion y guion bajo' },
                    ]}
                >
                    <Input placeholder="ej. voyager" maxLength={60} disabled={isEdit} />
                </Form.Item>
                <Form.Item name="type" label="Tipo" rules={[{ required: true, message: 'Requerido' }]}>
                    <Select options={TYPE_OPTIONS} />
                </Form.Item>

                {type !== 'none' && (
                    <Form.Item
                        name="url"
                        label={type === 'wms' ? 'URL base del servicio WMS' : 'Plantilla de tiles XYZ'}
                        extra={type === 'wms' ? 'URL del endpoint WMS (…/wms).' : 'Plantilla con {z}/{x}/{y}. Para subdominios: {s} con la lista de abajo, o un rango tipo {a-c} / {1-4}.'}
                        rules={[{ required: true, message: 'Requerido' }]}
                    >
                        <Input placeholder={type === 'wms' ? 'https://…/wms' : 'https://…/{z}/{x}/{y}{r}.png'} />
                    </Form.Item>
                )}

                {type === 'xyz' && (
                    <>
                        <Form.Item name="subdomains" label="Subdominios (opcional)" extra="Se rotan en {s} de la plantilla.">
                            <Select mode="tags" placeholder="a, b, c, d" tokenSeparators={[',', ' ']} />
                        </Form.Item>
                        <Form.Item name="labelsUrl" label="Overlay de etiquetas — URL (opcional)" extra="Capa de labels separada (p. ej. voyager_only_labels).">
                            <Input placeholder="https://…only_labels/{z}/{x}/{y}{r}.png" />
                        </Form.Item>
                        <Form.Item
                            name="labelZoomThreshold"
                            label="Umbral de zoom para etiquetas (opcional)"
                            extra="El overlay se muestra desde este zoom. Usa 1 para que siempre esté visible (0 lo desactiva)."
                        >
                            <InputNumber min={0} max={24} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            name="maxZoom"
                            label="Zoom máximo del proveedor (opcional)"
                            extra="Último nivel con teselas reales; más allá el visor estira la última tesela en vez de dejar el mapa en blanco."
                        >
                            <InputNumber min={0} max={24} style={{ width: '100%' }} />
                        </Form.Item>
                    </>
                )}

                {type === 'wms' && (
                    <Form.Item
                        name="wmsParams"
                        label="Parámetros WMS (JSON)"
                        extra={'Ej. {"LAYERS":"ws:capa","FORMAT":"image/png","TRANSPARENT":true,"VERSION":"1.1.0"}'}
                    >
                        <Input.TextArea rows={4} placeholder='{"LAYERS":"…"}' />
                    </Form.Item>
                )}

                <Form.Item name="attributions" label="Atribuciones (HTML, opcional)">
                    <Input.TextArea rows={2} placeholder="&copy; …" />
                </Form.Item>
                <Form.Item name="thumbnailUrl" label="Miniatura — URL (opcional)">
                    <Input placeholder="https://…" />
                </Form.Item>
                <Form.Item name="orden" label="Orden">
                    <InputNumber min={0} max={9999} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="activo" label="Activo" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
}
