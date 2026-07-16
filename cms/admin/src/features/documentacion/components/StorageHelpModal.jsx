import { Modal } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import StorageTopic from '@features/documentacion/topics/StorageTopic';

export default function StorageHelpModal({ open, tab = 'uso', onClose }) {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            title={<><BookOutlined /> Documentación · Storage</>}
            styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
        >
            {open && <StorageTopic key={tab} defaultActiveTab={tab} showHeader={false} />}
        </Modal>
    );
}
