import { Card, Form, Input, Button, message, Space, Typography, Upload, Avatar } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../utils/config';
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const updateUserStore = useAuthStore((state) => state.login); 
  const [form] = Form.useForm();

  // Fetch Current Profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  // Update form when profile is loaded
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      });
    }
  }, [profile, form]);

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.put(`${API_URL}/users/me`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: (updatedUser) => {
      message.success('Profile updated successfully');
      // Update local storage/store
      if (user && accessToken) {
        updateUserStore(accessToken, { 
          ...user, 
          name: updatedUser.name, 
          email: updatedUser.email,
          avatar: updatedUser.avatar
        });
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (values: any) => {
    const data = { ...values };
    if (!data.password) delete data.password;
    if (data.password !== data.confirmPassword) {
      return message.error('Passwords do not match');
    }
    delete data.confirmPassword;
    updateMutation.mutate(data);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card bordered={false} className="enterprise-card">
        <Title level={3}><UserOutlined /> My Account Settings</Title>
        <Text type="secondary">Manage your personal information and security</Text>
        
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <Space direction="vertical" align="center">
            <Avatar size={100} src={form.getFieldValue('avatar')} icon={<UserOutlined />} />
            <Upload
              name="image"
              action={`${API_URL}/upload`}
              headers={{ Authorization: `Bearer ${accessToken}` }}
              showUploadList={false}
              onChange={(info) => {
                if (info.file.status === 'done') {
                  const url = info.file.response.url;
                  form.setFieldsValue({ avatar: url });
                  message.success('Avatar uploaded successfully. Click Update to save.');
                } else if (info.file.status === 'error') {
                  message.error('Avatar upload failed');
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Change Photo</Button>
            </Upload>
          </Space>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit} 
          initialValues={{ name: user?.name, email: user?.email, avatar: user?.avatar }}
        >
          <Form.Item name="avatar" hidden>
            <Input />
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Full Name" 
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Your full name" />
          </Form.Item>

          <Form.Item 
            name="email" 
            label="Email Address" 
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Your email address" />
          </Form.Item>

          <Card title="Change Password" size="small" style={{ marginBottom: 24, background: '#fafafa' }}>
            <Form.Item 
              name="password" 
              label="New Password"
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Leave blank to keep current" />
            </Form.Item>

            <Form.Item 
              name="confirmPassword" 
              label="Confirm New Password"
              dependencies={['password']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm your new password" />
            </Form.Item>
          </Card>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={updateMutation.isPending} 
              block 
              size="large"
            >
              Update Account
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
