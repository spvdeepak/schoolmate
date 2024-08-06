import React, { useState, useEffect } from "react";
import { Layout, Typography, Space, Input, Card, Row, Col, Dropdown, Menu, message, Button, Modal, Form } from "antd";
import { SearchOutlined, EllipsisOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import Navbar from "../../../components/Navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editedSubject, setEditedSubject] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const urlSearchParams = new URLSearchParams(location.search);
  const standard_name = urlSearchParams.get("standard");

  useEffect(() => {
    fetchSubjects();
  }, [standard_name]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_subject", { standard_name: standard_name });

      console.log("Fetch Subjects Request:", { standard_name });
      console.log("Fetch Subjects Response:", response.data);

      if (response.data.message && Array.isArray(response.data.message)) {
        setSubjects(response.data.message);
        setFilteredSubjects(response.data.message);
      } else {
        setSubjects([]);
        setFilteredSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchInput(value);

    const filtered = subjects.filter((subject) =>
      subject.subject_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSubjects(filtered);
  };

  const menu = (subject) => (
    <Menu>
      <Menu.Item key="1" onClick={() => handleEdit(subject)}>
        <EditOutlined /> Edit Subject
      </Menu.Item>
      <Menu.Item key="2" onClick={() => handleDelete(subject)}>
        <DeleteOutlined /> Delete Subject
      </Menu.Item>
    </Menu>
  );

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleEdit = (subject) => {
    setEditedSubject(subject);
    setIsEditModalVisible(true);
    editForm.setFieldsValue(subject);
  };

  const handleDelete = async (subject) => {
    try {
      await axios.post("http://localhost:3000/admin/delete_subject", {
        subject_id: subject.subject_id,
      });

      console.log("Delete Subject Request:", { subject_id: subject.subject_id });
      console.log("Delete Subject Response: Deleted successfully");

      fetchSubjects();
      message.success("Subject deleted successfully");
    } catch (error) {
      console.error("Failed to delete subject:", error);
      message.error("Failed to delete subject");
    }
  };

  const handleAddOk = async () => {
    try {
      const values = await createForm.validateFields();
      await axios.post("http://localhost:3000/admin/create_subject", {
        subject_name: values.subject_name,
        standard_name: standard_name,
      });

      console.log("Create Subject Request:", { subject_name: values.subject_name, standard_name });
      console.log("Create Subject Response: Created successfully");

      createForm.resetFields();
      setIsAddModalVisible(false);
      fetchSubjects();
      message.success("Subject created successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to create subject");
    }
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.post("http://localhost:3000/admin/update_subject", { subject_id: editedSubject.subject_id, ...values });

      console.log("Update Subject Request:", { subject_id: editedSubject.subject_id, ...values });
      console.log("Update Subject Response: Updated successfully");

      editForm.resetFields();
      setIsEditModalVisible(false);
      fetchSubjects();
      message.success("Subject updated successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to update subject");
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditedSubject(null);
  };

  const redirectToDetails = (subjectId, subjectStandard, subjectName) => {
    console.log("Redirecting to details for subject:", subjectName, "and standard:", subjectStandard);

    const encodedSubjectName = encodeURIComponent(subjectName);
    const encodedSubjectId = encodeURIComponent(subjectId);
    const encodedStandard = encodeURIComponent(subjectStandard);

    navigate(`/subject/substand/view?subject=${encodedSubjectId}&subjectNam=${encodedSubjectName}&standard=${encodedStandard}`);
  };



  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Content style={{ padding: '24px', minHeight: '280px' }}>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Subjects</Title>
            <Space>
              <Input
                placeholder="Search Subjects"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 500, borderRadius: "50px" }}
              />
              <Button type="primary" onClick={handleAdd}>
                Add Subject
              </Button>
            </Space>
          </Space>

          <div style={{ maxHeight: "calc(110vh - 280px)", overflowY: "auto" }}>
            <Row gutter={[16, 16]} style={{ padding: "16px", borderRadius: "8px", maxWidth: "100%" }}>
              {filteredSubjects.map((subject, index) => (
                <Col key={index} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    title={<span style={{ fontSize: '25px', fontWeight: 'bold' }}>{subject.subject_name}</span>}
                    extra={
                      <Dropdown overlay={() => menu(subject)} placement="bottomRight" trigger={['click']}>
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
                      height: '150px',
                      userSelect: 'none',
                    }}
                    onDoubleClick={() => redirectToDetails(subject.subject_id, subject.standard_name, subject.subject_name)}
                  >
                    <p style={{ marginBottom: 0, color: "#666" }}>Standard: {subject.standard_name || 'N/A'}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <Modal title="Add Subject" visible={isAddModalVisible} onOk={handleAddOk} onCancel={handleAddCancel}>
            <Form form={createForm} layout="vertical" name="subject_form">
              <Form.Item name="subject_name" label="Subject Name" rules={[{ required: true, message: "Please input the subject name!" }]}>
                <Input />
              </Form.Item>
            </Form>
          </Modal>

          <Modal title="Edit Subject" visible={isEditModalVisible} onOk={handleEditOk} onCancel={handleEditCancel}>
            <Form form={editForm} layout="vertical" name="edit_subject_form">
              <Form.Item name="subject_name" label="Subject Name" rules={[{ required: true, message: "Please input the subject name!" }]}>
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Subject;
