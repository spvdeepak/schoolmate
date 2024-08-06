import React, { useState } from "react";
import { Layout, Modal, Form, Input, Select } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import Calendar from "../../components/Calendar/Calendar";
import { PlusOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const CalendarView = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      axios.post("http://localhost:3000/admin/create_event", values, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log("Event created successfully:", response.data);
          handleCancel();
        })
        .catch((error) => {
          console.error("Error creating event:", error);
        });
    });
  };

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout>
        <Content>
          <Calendar />

          <FloatButton tooltip={<div>Create Events</div>} onClick={showModal} icon={<PlusOutlined />} />

          <Modal
            title="Create Event"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Form form={form}>
              <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
              <Form.Item label="Event" name="event" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                <Select>
                  <Option value="0">Holidays</Option>
                  <Option value="1">Important</Option>
                  <Option value="2">Programs</Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CalendarView;
