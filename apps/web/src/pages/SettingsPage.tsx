import React, { useEffect } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Divider, Spin, Upload } from 'antd';
import { SaveOutlined, GlobalOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../utils/config';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // Fetch Settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        siteName: settings.siteName || 'OCMS Management',
        siteLogo: settings.siteLogo || '',
        footerText: settings.footerText || '© 2026 OCMS Management. All rights reserved.',
        contactEmail: settings.contactEmail || '',
        supportPhone: settings.supportPhone || '',
      });
    }
  }, [settings, form]);

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.post(`${API_URL}/settings`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const onFinish = (values: any) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Site Settings</Title>
      <Text type="secondary">Customize your application's appearance and general configuration.</Text>
      
      <Divider />

      <Card title={<Space><GlobalOutlined /> General Configuration</Space>} variant="outlined">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Site Name"
            name="siteName"
            rules={[{ required: true, message: 'Please input the site name!' }]}
          >
            <Input placeholder="Enter site name" />
          </Form.Item>

          <Form.Item
            label="Site Logo"
            name="siteLogo"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input placeholder="Logo URL" />
              <Upload
                name="image"
                action={`${API_URL}/upload`}
                headers={{ Authorization: `Bearer ${accessToken}` }}
                listType="picture"
                maxCount={1}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    const url = info.file.response.url;
                    form.setFieldsValue({ siteLogo: url });
                    message.success('Logo uploaded successfully');
                  } else if (info.file.status === 'error') {
                    message.error('Logo upload failed');
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
            </Space>
          </Form.Item>

          <Form.Item
            label="Footer Text"
            name="footerText"
          >
            <Input.TextArea rows={2} placeholder="Enter footer text" />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Contact Email"
            name="contactEmail"
            rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input placeholder="Enter contact email" />
          </Form.Item>

          <Form.Item
            label="Support Phone"
            name="supportPhone"
          >
            <Input placeholder="Enter support phone" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={updateMutation.isPending} 
              block
            >
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
