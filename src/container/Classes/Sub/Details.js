import React, { useState, useEffect } from "react";
import { Layout, Typography, Table, Modal, Form, Input, Select, Button, message, Space } from "antd";
import Navbar from "../../../components/Navbar/Navbar";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const Details = () => {
  const [students, setStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEditStudent, setSelectedEditStudent] = useState(null);
  const [selectedAssignStudent, setSelectedAssignStudent] = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentSectionId = searchParams.get("section");

  const [form] = Form.useForm();

  useEffect(() => {
    if (currentSectionId) {
      setSectionId(currentSectionId);
      fetchStudents(currentSectionId);
    }
  }, [currentSectionId]);

  useEffect(() => {
    console.log("Selected Assign Student:", selectedAssignStudent);
  }, [selectedAssignStudent]);

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
          <Button onClick={() => showEditModal(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.s_id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const fetchStudents = async (sectionId) => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_student", { section_id: sectionId });
      console.log("API Response:", response.data);
      if (response.data && response.data.message && Array.isArray(response.data.message)) {
        setStudents(response.data.message);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchUnassignedStudents = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_studentAll");

      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        const unassignedStudents = response.data.result.filter(student => student.section_id === null);
        setUnassignedStudents(unassignedStudents);
      } else {
        setUnassignedStudents([]);
      }
    } catch (error) {
      console.error("Error fetching unassigned students:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
    fetchUnassignedStudents();
  };

  const showEditModal = (student) => {
    console.log("Selected Student (Edit Form):", student);
    console.log("Selected Student ID:", student.s_id);
    setSelectedEditStudent(student);
    form.setFieldsValue(student);
    setIsModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      if (selectedEditStudent) {
        values.s_id = selectedEditStudent.s_id;
        await axios.post("http://localhost:3000/admin/update_student", values);
        message.success("Student updated successfully");
      } else if (selectedAssignStudent) {
        const assignValues = {
          s_id: selectedAssignStudent.s_id,
          section_id: selectedAssignStudent.section_id,
        }
        await axios.post("http://localhost:3000/admin/update_student", assignValues);
        message.success("Student assigned successfully");
      }

      form.resetFields();
      setIsModalVisible(false);
      setSelectedEditStudent(null);
      setSelectedAssignStudent(null);
      fetchStudents(sectionId);
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Operation failed");
    }
  };

  const handleEditCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setSelectedEditStudent(null);
  };

  const handleDelete = async (studentId) => {
    try {
      await axios.post("http://localhost:3000/admin/update_student", { s_id: studentId, section_id: null });
      fetchStudents(sectionId);
      message.success("Student removed from the Section successfully");
    } catch (error) {
      console.error("Failed to remove student from the Section:", error);
      message.error("Failed to remove student from the Section");
    }
  };


  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout>
        <Content style={{ padding: '24px', minHeight: '280px' }}>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Students</Title>
            <Space>
              <Input
                placeholder="Search Students"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 500, borderRadius: "50px" }}
              />
            </Space>
          </Space>

          <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
            Assign Student
          </Button>

          <Table
            columns={columns}
            dataSource={students.filter(student => student.s_name.toLowerCase().includes(searchTerm.toLowerCase()))}
            pagination={{ pageSize: 10 }}
            rowKey="s_id"
            style={{ userSelect: 'none' }}
          />

          <Modal
            title={"Edit Student"}
            visible={isModalVisible}
            onOk={handleEditOk}
            onCancel={handleEditCancel}
          >
            {selectedEditStudent ? (
              <Form form={form} layout="vertical" name="student_form">
                <Form.Item name="s_name" label="Student Name" rules={[{ required: true, message: "Please input the student name!" }]}>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="section_id"
                  label="Section ID"
                  initialValue={sectionId}
                  rules={[{ required: true, message: "Please input the section ID!" }]}
                >
                  <Input readOnly />
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
            ) : (
              <Form form={form} layout="vertical" name="student_form">
                <Form.Item
                  name="s_name"
                  label="Student Name"
                  rules={[{ required: true, message: "Please select the student name!" }]}
                >
                  <Select
                    showSearch
                    placeholder="Select Student"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onSelect={(value, option) => {
                      setSelectedAssignStudent({
                        s_id: value,
                        section_id: sectionId,
                        s_name: option.children
                      });
                      console.log("Selected Assign Student:", selectedAssignStudent);
                    }}
                  >
                    {unassignedStudents.map((student) => (
                      <Option key={student.s_id} value={student.s_id}>
                        {student.s_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="section_id"
                  label="Section ID"
                  initialValue={sectionId}
                  rules={[{ required: true, message: "Please input the section ID!" }]}
                >
                  <Input readOnly />
                </Form.Item>
              </Form>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Details;
