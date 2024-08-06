import React, { useState, useEffect, useCallback } from "react";
import { Layout, Typography, Space, Input, Table, Button, Modal, Form, message, Select } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";

const { Content } = Layout;
const { Title } = Typography;

const Educator = () => {
  // eslint-disable-next-line
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editedTeacher, setEditedTeacher] = useState(null);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_teacher");
      console.log("Server Response:", response);

      if (response.data.message && Array.isArray(response.data.message)) {
        setTeachers(response.data.message);

        const filtered = response.data.message.filter((teacher) =>
          Object.values(teacher).some((value) =>
            value.toString().toLowerCase().includes(searchInput.toLowerCase())
          )
        );
        setFilteredTeachers(filtered);
      } else {
        setTeachers([]);
        setFilteredTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  }, [searchInput]);


  useEffect(() => {
    fetchTeachers();
  }, [searchInput, fetchTeachers]);



  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleEdit = (teacher) => {
    setEditedTeacher(teacher);
    setIsEditModalVisible(true);
    editForm.setFieldsValue(teacher);
  };

  const handleDelete = async (t_id) => {
    try {
      await axios.post("http://localhost:3000/admin/delete_teacher", {
        t_id,
      });
      fetchTeachers();
      message.success("Teacher deleted successfully");
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const responseData = error.response.data;
        if (responseData.details && responseData.details.includes("foreign key constraint")) {
          message.error("Teacher cannot be deleted. Teacher Assigned to a Section.");
        } else {
          console.error("Failed to delete teacher:", error);
          message.error("Failed to delete teacher");
        }
      } else {
        console.error("Failed to delete teacher:", error);
        message.error("Failed to delete teacher");
      }
    }
  };

  const handleAddOk = async () => {
    try {
      const values = await createForm.validateFields();
      await axios.post("http://localhost:3000/admin/create_teacher", values);
      createForm.resetFields();
      setIsAddModalVisible(false);
      fetchTeachers();
      message.success("Teacher created successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to create teacher");
    }
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.post("http://localhost:3000/admin/update_teacher", { t_id: editedTeacher.t_id, ...values });
      editForm.resetFields();
      setIsEditModalVisible(false);
      fetchTeachers();
      message.success("Teacher updated successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to update teacher");
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditedTeacher(null);
  };

  const handleRowDoubleClick = (record) => {
    console.log("Double click on row:", record);
    Modal.info({
      title: "Teacher Details",
      content: (
        <div>
          <p><strong>Teacher Name:</strong> {record.t_name}</p>
          <p><strong>Phone Number:</strong> {record.phone_no}</p>
          <p><strong>Qualification:</strong> {record.qualification}</p>
          <p><strong>Gender:</strong> {record.gender}</p>
          <p><strong>Designation:</strong> {record.designation}</p>
          <p><strong>Bank Account Details:</strong> {record.bank_ac_detail}</p>
          <p><strong>Address:</strong> {record.address}</p>
          <p><strong>Salary:</strong> {record.salary}</p>
        </div>
      ),
      onOk() { },
    });
  };

  const columns = [
    {
      title: "Teacher Name",
      dataIndex: "t_name",
      key: "t_name",
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.t_id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Content style={{ padding: '24px', minHeight: '280px' }}>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Teachers</Title>
            <Space>
              <Input
                placeholder="Search Teachers"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
              <Button type="primary" onClick={handleAdd}>
                Add Teacher
              </Button>
            </Space>
          </Space>
          <Table
            dataSource={filteredTeachers}
            columns={columns}
            rowKey="t_id"
            onRow={(record) => ({
              onDoubleClick: () => handleRowDoubleClick(record),
            })}
            style={{ userSelect: 'none' }}
          />

          <Modal title="Add Teacher" visible={isAddModalVisible} onOk={handleAddOk} onCancel={handleAddCancel}>
            <Form form={createForm} layout="vertical" name="teacher_form">
              <Form.Item name="t_name" label="Teacher Name" rules={[{ required: true, message: "Please input the teacher name!" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone_no" label="Phone Number" rules={[{ required: true, message: "Please input the phone number!" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="qualification" label="Qualification" rules={[{ required: true, message: "Please input the qualification!" }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select the gender!" }]}
              >
                <Select placeholder="Select gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="designation" label="Designation">
                <Input />
              </Form.Item>
              <Form.Item name="bank_ac_detail" label="Bank Account Details">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ required: true, message: "Please input the address!" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="salary" label="Salary" rules={[{ required: true, message: "Please input the salary!" }]}>
                <Input />
              </Form.Item>
            </Form>
          </Modal>

          <Modal title="Edit Teacher" visible={isEditModalVisible} onOk={handleEditOk} onCancel={handleEditCancel}>
            <Form form={editForm} layout="vertical" name="edit_teacher_form">
              <Form.Item name="t_name" label="Teacher Name" rules={[{ required: true, message: "Please input the teacher name!" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone_no" label="Phone Number" rules={[{ required: true, message: "Please input the phone number!" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="qualification" label="Qualification" rules={[{ required: true, message: "Please input the qualification!" }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select the gender!" }]}
              >
                <Select placeholder="Select gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="designation" label="Designation">
                <Input />
              </Form.Item>
              <Form.Item name="bank_ac_detail" label="Bank Account Details">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ required: true, message: "Please input the address!" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="salary" label="Salary" rules={[{ required: true, message: "Please input the salary!" }]}>
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Educator;
