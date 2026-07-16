import { useState } from 'react';
import { Form, Input, Button, Typography, Flex, Row, Col, theme } from 'antd';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@shared/contexts/useAuth';
import useIsMobile from '@shared/hooks/useIsMobile';
import { BRAND } from '@app/providers/brand';
import { message } from '@shared/services/message';

const { Title, Text } = Typography;
const { useToken } = theme;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { token } = useToken();
    const { isMobile } = useIsMobile();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const data = await login(values.username, values.password);

            message.success('¡Inicio de sesión exitoso!');

            if (data.user.must_change_password) {
                navigate('/change-password');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            const status = error.response?.status;
            const detail = error.response?.data?.detail;

            if (status === 401) {
                form.setFields([
                    { name: 'password', errors: [detail || 'Usuario o contraseña incorrectos'] }
                ]);
            } else {
                message.error(detail || 'Error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex
            vertical
            align="center"
            justify="center"
            style={{
                minHeight: '100dvh',
                width: '100%',
                boxSizing: 'border-box',
                paddingInline: 'max(20px, env(safe-area-inset-left), env(safe-area-inset-right))',
                paddingBlock: 'max(24px, env(safe-area-inset-top))',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
                background: '#F1F5F9',
                overscrollBehavior: 'none',
                overflowX: 'hidden',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 1088,
                    marginInline: 'auto',
                    background: token.colorBgContainer,
                    borderRadius: 28,
                    boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)',
                    padding: 'clamp(32px, 5vw, 72px) clamp(20px, 4vw, 56px)',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                }}
            >
                <Row
                    gutter={[
                        { xs: 0, sm: 0, md: 32, lg: 48 },
                        { xs: 24, sm: 24, md: 0 },
                    ]}
                    align="middle"
                    style={{ margin: 0 }}
                >
                    <Col xs={24} md={12}>
                        <Flex vertical align="center" justify="center">
                            <div style={{ width: '100%', maxWidth: 260 }}>
                                <Flex vertical gap={4} style={{ marginBottom: token.marginXL }}>
                                    <Title style={{ margin: 0, color: BRAND.numeralia, fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                                        Hola
                                    </Title>
                                    <Text style={{ fontSize: 12, color: BRAND.graphite, fontWeight: 400 }}>
                                        Ingresa tus datos para iniciar sesión.
                                    </Text>
                                </Flex>

                                <Form
                                    form={form}
                                    name="login"
                                    onFinish={onFinish}
                                    autoComplete="off"
                                    layout="vertical"
                                    initialValues={import.meta.env.DEV ? { username: 'admin' } : {}}
                                    className="login-form"
                                    requiredMark={(label, info) => (
                                        <>
                                            {label}
                                            {info.required && (
                                                <span style={{ color: BRAND.secondary, marginLeft: 4, fontWeight: 700 }}>*</span>
                                            )}
                                        </>
                                    )}
                                >
                                    <Form.Item
                                        label="Usuario o correo electrónico"
                                        name="username"
                                        normalize={(value) => (value ? value.replace(/\s/g, '').toLowerCase() : value)}
                                        rules={[{ required: true, message: 'Ingrese su usuario' }]}
                                    >
                                        <Input placeholder="Usuario o correo electrónico" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Contraseña"
                                        name="password"
                                        rules={[{ required: true, message: 'Ingrese su contraseña' }]}
                                    >
                                        <Input.Password
                                            placeholder="Contraseña"
                                            iconRender={(visible) => (
                                                visible
                                                    ? <Eye size={18} color={BRAND.graphite} />
                                                    : <EyeOff size={18} color={BRAND.graphite} />
                                            )}
                                        />
                                    </Form.Item>

                                    <Form.Item style={{ marginTop: token.marginXL, marginBottom: 0 }}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            block
                                            style={{
                                                height: 40,
                                                borderRadius: 20,
                                                fontWeight: 600,
                                                fontSize: 14,
                                            }}
                                        >
                                            Iniciar sesión
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </Flex>
                    </Col>

                    {!isMobile && (
                        <Col xs={0} md={12}>
                            <Flex vertical align="center" justify="center" gap={16}>
                                <img
                                    src={`${import.meta.env.BASE_URL}mapamex-logo.svg`}
                                    alt="MapaMex"
                                    style={{ maxWidth: 240, width: '100%', height: 'auto' }}
                                />
                                <Text style={{ fontSize: 14, color: BRAND.graphite }}>
                                    Panel de administración
                                </Text>
                            </Flex>
                        </Col>
                    )}
                </Row>
            </div>
        </Flex>
    );
}
