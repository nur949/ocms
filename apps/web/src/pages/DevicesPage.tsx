import { Button, Space, Modal, Form, Input, message, Popconfirm, Card, Typography, Row, Col, Grid, Upload, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../utils/config';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, RocketOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const DevicesPage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null);
  const [form] = Form.useForm();
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/devices`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = { ...values, imageUrl };
      if (editingDevice) {
        return axios.put(`${API_URL}/devices/${editingDevice.id}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
      return axios.post(`${API_URL}/devices`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
    onSuccess: () => {
      message.success(`Device ${editingDevice ? 'updated' : 'added'} successfully`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingDevice(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/devices/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
    onSuccess: () => {
      message.success('Device deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const handleAdd = () => {
    setEditingDevice(null);
    setImageUrl('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingDevice(record);
    setImageUrl(record.imageUrl || '');
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  const filteredData = devices?.filter((item: any) => 
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setImageUrl(res.data.url);
      onSuccess("ok");
      message.success('Image uploaded successfully');
    } catch (err) {
      console.error(err);
      onError({ err });
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Card bordered={false} className="enterprise-card" bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>Devices Management</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
              block={isMobile}
            >
              Add Device
            </Button>
          </div>
          
          <Row gutter={[8, 8]}>
            <Col xs={24} md={12}>
              <Input
                placeholder="Search device name..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
          </Row>
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredData?.map((device: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={device.id}>
                <div 
                  onMouseEnter={() => setHoveredDevice(device.id)}
                  onMouseLeave={() => setHoveredDevice(null)}
                  style={{ position: 'relative', height: '100%' }}
                >
                  <Card
                    hoverable
                    className="enterprise-card"
                    style={{ height: '100%', borderRadius: '12px', overflow: 'hidden' }}
                    bodyStyle={{ padding: '16px', textAlign: 'center' }}
                    cover={
                      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', overflow: 'hidden' }}>
                        {device.imageUrl ? (
                          <img alt={device.name} src={device.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <RocketOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />
                        )}
                      </div>
                    }
                  >
                    <Title level={5} style={{ margin: 0 }} ellipsis={{ tooltip: device.name }}>
                      {device.name}
                    </Title>
                  </Card>
                  {hoveredDevice === device.id && (
                    <Button 
                      type="primary" 
                      shape="circle"
                      icon={<EditOutlined />} 
                      onClick={() => handleEdit(device)}
                      style={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12, 
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    />
                  )}
                </div>
              </Col>
            ))}
            {filteredData?.length === 0 && (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No devices found.
                </div>
              </Col>
            )}
          </Row>
        )}
      </Card>

      <Modal
        title={editingDevice ? "Edit Device" : "Add New Device"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={isMobile ? '90%' : 400}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item 
            name="name" 
            label="Device Model Name" 
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input placeholder="e.g. Android POS" prefix={<RocketOutlined />} />
          </Form.Item>
          
          <Form.Item label="Device Image">
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={customUpload}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="device" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <div>
                  {uploading ? <Spin /> : <UploadOutlined />}
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingDevice ? (
                <Popconfirm
                  title="Permanently delete this device?"
                  onConfirm={() => deleteMutation.mutate(editingDevice.id)}
                  okText="Yes, Delete"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger type="text" icon={<DeleteOutlined />}>
                    Delete Device
                  </Button>
                </Popconfirm>
              ) : (
                <div />
              )}
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={mutation.isPending || uploading}>
                  Save Device
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DevicesPage;

