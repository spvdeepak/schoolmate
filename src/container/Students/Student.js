import React, { useState, useEffect } from "react";
import { Layout, Typography, Space, Input, Button, Table, Modal, Form, message, Select } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const { Content } = Layout;
const { Title } = Typography;

const Student = () => {
  const [searchInput, setSearchInput] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentForm] = Form.useForm();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Update filteredStudents whenever students or searchInput changes
    const filtered = students.filter(student =>
      Object.values(student).some(value =>
        value.toString().toLowerCase().includes(searchInput.toLowerCase())
      )
    );
    setFilteredStudents(filtered);
  }, [students, searchInput]);

  const columns = [
    { title: "Student Name", dataIndex: "s_name", key: "s_name" },
    { title: "EMIS No", dataIndex: "emis_no", key: "emis_no" },
    { title: "Fees", dataIndex: "fees", key: "fees" },
    { title: "Due", dataIndex: "due", key: "due" },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.s_id)}>
            Delete
          </Button>
          <Button onClick={() => showViewModal(record)}>View</Button>
        </Space>
      ),
    },
  ];

  const fetchStudents = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_studentAll");
      if (response.data.result && Array.isArray(response.data.result)) {
        setStudents(response.data.result);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await studentForm.validateFields();
      await axios.post("http://localhost:3000/admin/create_student", values);
      studentForm.resetFields();
      setIsModalVisible(false);
      fetchStudents();
      message.success("Student created successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to create student");
    }
  };

  const handleCancel = () => {
    studentForm.resetFields();
    setIsModalVisible(false);
  };

  const showEditModal = (student) => {
    setSelectedStudent(student);
    setIsEditModalVisible(true);
    studentForm.setFieldsValue(student);
  };

  const handleEditOk = async () => {
    try {
      const values = await studentForm.validateFields();
      await axios.post("http://localhost:3000/admin/update_student", { ...values, s_id: selectedStudent.s_id });
      studentForm.resetFields();
      setIsEditModalVisible(false);
      fetchStudents();
      message.success("Student updated successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to update student");
    }
  };

  const handleEditCancel = () => {
    studentForm.resetFields();
    setIsEditModalVisible(false);
    setSelectedStudent(null);
  };

  const handleDelete = async (studentId) => {
    try {
      await axios.post("http://localhost:3000/admin/delete_student", {
        s_id: studentId,
      });
      fetchStudents();
      message.success("Student deleted successfully");
    } catch (error) {
      console.error("Failed to delete student:", error);
      message.error("Failed to delete student");
    }
  };

  const showViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setSelectedStudent(null);
  };

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout>
        <Content style={{ padding: "24px", minHeight: "280px" }}>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Students</Title>
            <Space>
              <Input
                placeholder="Search Students"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 500, borderRadius: "50px" }}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                Add Student
              </Button>
            </Space>
          </Space>

          <div style={{ overflowY: 'auto', maxHeight: '570px' }}>
            <Table
              columns={columns}
              dataSource={filteredStudents}
              pagination={{ pageSize: 10 }}
              onRow={(record, rowIndex) => ({
                onDoubleClick: () => showViewModal(record),
              })}
              style={{ userSelect: 'none' }}
            />
          </div>

          <Modal
            title="Add Student"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Form form={studentForm} layout="vertical" name="student_form">
              <Form.Item name="s_name" label="Student Name" rules={[{ required: true, message: "Please input the student name!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="section_id" label="Section ID">
                <Input />
              </Form.Item>
              <Form.Item name="blood_group" label="Blood Group" rules={[{ required: true, message: "Please input the blood group!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="address" label="Address" rules={[{ required: true, message: "Please input the address!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="father_name" label="Father's Name" rules={[{ required: true, message: "Please input the father's name!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="emis_no" label="EMIS No" rules={[{ required: true, message: "Please input the EMIS No!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="fees" label="Fees" rules={[{ required: true, message: "Please input the fees!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="due" label="Due" rules={[{ required: true, message: "Please input the due amount!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="phone_no_1" label="Phone No 1" rules={[{ required: true, message: "Please input phone number 1!" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="phone_no_2" label="Phone No 2" rules={[{ required: true, message: "Please input phone number 2!" }]}>
                <Input />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select the gender!" }]}
              >
                <Select placeholder="Select Gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          <Modal title="Edit Student" visible={isEditModalVisible} onOk={handleEditOk} onCancel={handleEditCancel}>
            <Form form={studentForm} layout="vertical" name="edit_student_form">
              <Form.Item
                name="s_name"
                label="Student Name"
                rules={[{ required: true, message: "Please input the student name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="section_id"
                label="Section ID"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="blood_group"
                label="Blood Group"
                rules={[{ required: true, message: "Please input the blood group!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Please input the address!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="father_name"
                label="Father's Name"
                rules={[{ required: true, message: "Please input the father's name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="emis_no"
                label="EMIS No"
                rules={[{ required: true, message: "Please input the EMIS No!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="fees"
                label="Fees"
                rules={[{ required: true, message: "Please input the fees!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="due"
                label="Due"
                rules={[{ required: true, message: "Please input the due!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="phone_no_1"
                label="Phone No 1"
                rules={[{ required: true, message: "Please input phone no 1!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="phone_no_2"
                label="Phone No 2"
                rules={[{ required: true, message: "Please input phone no 2!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select the gender!" }]}
              >
                <Select placeholder="Select Gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="View Student Details"
            visible={isViewModalVisible}
            onCancel={handleViewCancel}
            footer={[
              <Button key="back" onClick={handleViewCancel}>
                Close
              </Button>,
            ]}
          >
            {selectedStudent && (
              <div>
                <p><strong>Student Name:</strong> {selectedStudent.s_name}</p>
                <p><strong>Section ID:</strong> {selectedStudent.section_id}</p>
                <p><strong>Blood Group:</strong> {selectedStudent.blood_group}</p>
                <p><strong>Address:</strong> {selectedStudent.address}</p>
                <p><strong>Father's Name:</strong> {selectedStudent.father_name}</p>
                <p><strong>EMIS No:</strong> {selectedStudent.emis_no}</p>
                <p><strong>Fees:</strong> {selectedStudent.fees}</p>
                <p><strong>Due:</strong> {selectedStudent.due}</p>
                <p><strong>Phone No 1:</strong> {selectedStudent.phone_no_1}</p>
                <p><strong>Phone No 2:</strong> {selectedStudent.phone_no_2}</p>
                <p><strong>Gender:</strong> {selectedStudent.gender}</p>
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Student;
