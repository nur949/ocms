import { Form, Input, Button, DatePicker, InputNumber, Select, Card, Row, Col, message, Checkbox, Space, Grid } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../utils/config';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { useBreakpoint } = Grid;

const NewSalePage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  // Fetch Devices
  const { data: devicesList } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/devices`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  // Fetch Engineers
  const { data: engineers } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/engineers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  // Fetch Sales Persons
  const { data: salesPersons } = useQuery({
    queryKey: ['salesPersons'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/sales-persons`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await axios.post(`${API_URL}/sales`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: () => {
      message.success('Sale entry created successfully');
      navigate('/report');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create sale');
    },
  });

  const onFinish = (values: any) => {
    const payload = {
      ...values,
      saleDate: values.saleDate?.toISOString(),
      installDate: values.installDate?.toISOString(),
    };
    mutation.mutate(payload);
  };

  return (
    <Card 
      title={<span style={{ fontSize: isMobile ? '16px' : '18px' }}>Unified Sale & Installation Entry</span>}
      className="enterprise-card"
      bodyStyle={{ padding: isMobile ? '12px' : '24px' }}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ phone: [''], status: 'pending' }}
        size={isMobile ? "middle" : "large"}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
              <Input placeholder="Enter Customer Name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="businessName" label="Business Name" rules={[{ required: true }]}>
              <Input placeholder="Enter Business Name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.List
              name="phone"
              rules={[
                {
                  validator: async (_, names) => {
                    if (!names || names.length < 1) {
                      return Promise.reject(new Error('At least one phone number is required'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      label={index === 0 ? "Phone Number(s)" : ""}
                      required={index === 0}
                      key={field.key}
                      style={{ marginBottom: 8 }}
                    >
                      <Space align="baseline" style={{ display: 'flex', width: '100%' }}>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[{ required: true, whitespace: true, message: "Required" }]}
                          noStyle
                        >
                          <Input placeholder="Enter Phone Number" style={{ width: '100%' }} />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            style={{ fontSize: '18px', color: '#ff4d4f' }}
                          />
                        )}
                      </Space>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                      Add Phone
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="location" label="Location (District/Area)">
              <Input placeholder="e.g. Dhaka, Uttara" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={12} sm={8}>
            <Form.Item name="saleDate" label="Date of Sale">
              <DatePicker style={{ width: '100%' }} format="DD-MM-YY" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8}>
            <Form.Item name="installDate" label="Install Date">
              <DatePicker style={{ width: '100%' }} format="DD-MM-YY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="status" label="Status">
              <Select>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="assigned">Assigned</Select.Option>
                <Select.Option value="in-progress">In Progress</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={12} sm={8}>
            <Form.Item name="softwarePrice" label="Price" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8}>
            <Form.Item name="monthlyCharge" label="Monthly">
              <InputNumber style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="advanceAmount" label="Advance">
              <InputNumber style={{ width: '100%' }} placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="deviceIds" label="Devices/Equipment">
          <Checkbox.Group style={{ width: '100%' }}>
            <Row gutter={[8, 8]}>
              {devicesList?.map((device: any) => (
                <Col xs={12} sm={6} key={device.id}>
                  <Checkbox value={device.id}>{device.name}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="engineerName" label="Assign Engineer">
              <Select showSearch placeholder="Select Engineer" optionFilterProp="children">
                {engineers?.map((eng: any) => (
                  <Select.Option key={eng.id} value={eng.name}>{eng.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="soldBy" label="Sold By">
              <Select showSearch placeholder="Select Sales Person" optionFilterProp="children">
                {salesPersons?.map((sp: any) => (
                  <Select.Option key={sp.id} value={sp.name}>{sp.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="followupUpdate" label="Remarks">
          <TextArea rows={3} placeholder="Enter any follow-up notes or remarks..." />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} block size="large">
            Save Entry
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NewSalePage;

