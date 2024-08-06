import React, { useState, useEffect } from "react";
import { Layout, Typography, Row, Col, Button, Modal, Form, Input, Card, message, Space, Dropdown, Menu, Select } from "antd";
import { PlusOutlined, SearchOutlined, EllipsisOutlined } from "@ant-design/icons";
import Navbar from "../../../components/Navbar/Navbar";
import axios from "axios";
import romanize from "romanize";
import { useLocation, useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const Section = () => {
  const [searchInput, setSearchInput] = useState("");
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const location = useLocation();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [createSectionForm] = Form.useForm();
  const [editSectionForm] = Form.useForm();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const standard_name = params.get("standard");

  console.log(standard_name ?? "Standard name is not available");

  useEffect(() => {
    fetchSections();
    fetchTeachers();
  }, [standard_name]);

  const fetchSections = async () => {
    try {
      if (standard_name) {
        const response = await axios.post("http://localhost:3000/admin/view_section", {
          standard: standard_name,
        });

        if (response.data.result && Array.isArray(response.data.result)) {
          setSections(response.data.result);
          console.log("Sections fetched successfully:", response.data.result);
        } else {
          setSections([]);
          console.log("No sections found for the specified standard.");
        }
      } else {
        console.error("Error: standard_name is not valid");
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_teacher");
      console.log("Server Response:", response);

      if (response.data.message && Array.isArray(response.data.message)) {
        setTeachers(response.data.message);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateOk = async () => {
    try {
      const values = await createSectionForm.validateFields();

      await axios.post("http://localhost:3000/admin/create_section", {
        section_name: values.sectionName,
        t_id: values.teacherId,
        standard: standard_name,
      });

      createSectionForm.resetFields();
      setIsCreateModalVisible(false);
      fetchSections();
      message.success("Section created successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to create section");
    }
  };

  const handleCreateCancel = () => {
    createSectionForm.resetFields();
    setIsCreateModalVisible(false);
  };

  const showEditModal = (section) => {
    setSelectedSection(section);
    setIsEditModalVisible(true);
    editSectionForm.setFieldsValue({
      sectionName: section.section_name,
      teacherId: section.t_name,
    });
  };

  const handleEditOk = async () => {
    try {
      const values = await editSectionForm.validateFields();
      if (selectedSection && selectedSection.section_id) {
        await axios.post("http://localhost:3000/admin/update_section", {
          section_id: selectedSection.section_id,
          section_name: values.sectionName,
          t_id: values.teacherId,
          standard: standard_name,
        });
        editSectionForm.resetFields();
        setIsEditModalVisible(false);
        fetchSections();
        message.success("Section edited successfully");
      } else {
        message.error("Invalid section data");
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to edit section");
    }
  };

  const handleEditCancel = () => {
    editSectionForm.resetFields();
    setIsEditModalVisible(false);
    setSelectedSection(null);
  };

  const handleDelete = async (section) => {
    try {
      if (section && section.section_id) {
        await axios.post("http://localhost:3000/admin/delete_section", {
          section_id: section.section_id,
        });
        fetchSections();
        message.success("Section deleted successfully");
      } else {
        message.error("Invalid section data");
      }
    } catch (error) {
      console.error("Failed to delete section:", error);
      message.error("Failed to delete section");
    }
  };

  const menu = (section) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => showEditModal(section)}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleDelete(section)}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const filteredSections = sections.filter(
    (section) =>
      section.section_name &&
      section.section_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const redirectToDetails = (section) => {
    navigate(`/classes/sections/details?section=${section.section_id}`);
  };

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Content style={{ padding: "24px", minHeight: "280px", overflowY: "auto" }}>
          <Space
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2}>Sections - {romanize(standard_name)}</Title>
            <Space>
              <Input
                placeholder="Search Sections"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: 500, borderRadius: "50px" }}
              />
            </Space>
          </Space>

          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal} style={{ marginTop: 16 }}>
            Add Section
          </Button>

          <Row gutter={[16, 16]} style={{ padding: "16px", borderRadius: "8px" }}>
            {filteredSections.map((section, index) => {
              const teacher = teachers.find((t) => t.t_id === section.t_id) || { t_name: 'N/A' };

              return (
                <Col key={index} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    title={<span style={{ fontSize: '25px', fontWeight: 'bold' }}>{(section.section_name || 'N/A').toUpperCase()}</span>}
                    extra={
                      <Dropdown overlay={() => menu(section)} placement="bottomRight" trigger={['click']}>
                        <EllipsisOutlined
                          style={{ fontSize: 20, cursor: 'pointer', position: 'absolute', top: 16, right: 16 }}
                        />
                      </Dropdown>
                    }
                    style={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      marginBottom: "16px",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                    }}
                    onDoubleClick={() => redirectToDetails(section)}
                  >
                    <p style={{ marginBottom: 0, color: "#666" }}>Teacher : {section.t_name || 'N/A'}</p>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Modal title="Add Section" visible={isCreateModalVisible} onOk={handleCreateOk} onCancel={handleCreateCancel}>
            <Form form={createSectionForm} layout="vertical" name="create_section_form">
              <Form.Item
                name="sectionName"
                label="Section Name"
                rules={[{ required: true, message: "Please input the section name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="teacherId"
                label="Teacher"
                rules={[{ required: true, message: "Please select a Teacher!" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {teachers.map((teacher) => (
                    <Option key={teacher.t_id} value={teacher.t_id}>
                      {teacher.t_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          <Modal title="Edit Section" visible={isEditModalVisible} onOk={handleEditOk} onCancel={handleEditCancel}>
            <Form form={editSectionForm} layout="vertical" name="edit_section_form">
              <Form.Item
                name="sectionName"
                label="Section Name"
                rules={[{ required: true, message: "Please input the section name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="teacherId"
                label="Teacher"
                rules={[{ required: true, message: "Please select a Teacher!" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {teachers.map((teacher) => (
                    <Option key={teacher.t_id} value={teacher.t_id}>
                      {teacher.t_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Section;
