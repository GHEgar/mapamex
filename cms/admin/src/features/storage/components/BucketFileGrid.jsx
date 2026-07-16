import { Empty, Spin, Typography } from 'antd';
import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import { BRAND } from '@app/providers/brand';

const { Text } = Typography;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i;

export default function BucketFileGrid({ records, loading, onPick, onEnterDir }) {
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <Spin />
            </div>
        );
    }
    if (records.length === 0) {
        return (
            <Empty
                image={<FolderOpenOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />}
                description={<Text type="secondary">Sin archivos en esta carpeta</Text>}
                style={{ padding: 48 }}
            />
        );
    }
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
            padding: '12px 0',
        }}>
            {records.map((record) => {
                const basename = record.originalName || record.name.split('/').pop();
                const isDir = record.isDir;
                const isImage = !isDir && IMAGE_EXTENSIONS.test(basename);
                const handleClick = isDir && onEnterDir ? () => onEnterDir(record) : () => onPick(record);
                return (
                    <button
                        key={record.name || record.id}
                        type="button"
                        onClick={handleClick}
                        style={{
                            border: '1px solid #f0f0f0',
                            borderRadius: 8,
                            background: isDir ? BRAND.secondarySoft : '#fff',
                            padding: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'border-color .15s, box-shadow .15s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = isDir ? BRAND.secondary : BRAND.primary;
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#f0f0f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            background: isDir ? BRAND.secondarySoft : '#fafafa',
                            borderRadius: 6,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {isDir ? (
                                <FolderOutlined style={{ fontSize: 40, color: BRAND.secondary }} />
                            ) : isImage && record.url ? (
                                <img
                                    src={record.url}
                                    alt={basename}
                                    loading="lazy"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <FolderOpenOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
                            )}
                        </div>
                        <Text style={{ fontSize: 11, textAlign: 'center', wordBreak: 'break-all', color: isDir ? BRAND.primary : undefined }} ellipsis={{ tooltip: basename }}>
                            {isDir ? `📁 ${basename}` : basename}
                        </Text>
                    </button>
                );
            })}
        </div>
    );
}
