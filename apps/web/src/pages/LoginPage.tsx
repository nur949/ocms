import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { API_URL } from '../utils/config';

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, values);
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      message.success('Login successful');
      navigate('/');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed.';
      message.error(errorMsg);
      
      if (errorMsg === 'Incorrect password') {
        form.setFields([{ name: 'password', errors: [errorMsg] }]);
      } else if (errorMsg === 'User not found') {
        form.setFields([{ name: 'email', errors: [errorMsg] }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '16px'
    }}>
      <Card 
        className="enterprise-card"
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}
        title={<div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>OCMS Login</div>}
      >
        <Form 
          form={form}
          name="login" 
          onFinish={onFinish} 
          layout="vertical" 
          size="large"
        >
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="admin@ocms.com" disabled={loading} />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" disabled={loading} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{ height: '45px', fontSize: '16px', fontWeight: '600' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;

