import React from "react";
import { Form, Input, Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './Login.css';
import usersData from './users.json';

const { Content } = Layout;
const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Received values:', values);

    const user = usersData.users.find(u => u.schoolId === values.schoolId && u.password === values.password);

    if (user) {
      navigate("/classes");
    } else {
      console.log("Invalid credentials");
    }
  };

  return (
    <Layout className="login-layout">
      <Content className="login-content">
        <Form
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Title level={2} className="login-title">
            Login
          </Title>
          <Form.Item
            name="schoolId"
            label="School ID"
            rules={[{ required: true, message: 'Please input your School ID!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Enter your School ID"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Enter your Password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-button">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default Login;
