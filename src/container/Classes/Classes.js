import React, { useState, useEffect } from "react";
import { Layout, Typography, Row, Col, Button, Modal, Form, Input, Card, message, Space, Dropdown, Menu } from "antd";
import { PlusOutlined, SearchOutlined, EllipsisOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import romanize from "romanize";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

const Classes = () => {
  const [standards, setStandards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [standardForm] = Form.useForm();
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_standard");

      if (response.data.result && Array.isArray(response.data.result)) {
        setStandards(response.data.result);
      } else {
        setStandards([]);
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await standardForm.validateFields();
      await axios.post("http://localhost:3000/admin/create_standard", {
        standard_name: values.standardName,
        curriculum: values.curriculum,
      });
      standardForm.resetFields();
      setIsModalVisible(false);
      fetchStandards();
      message.success("Standard created successfully");
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to create standard");
    }
  };

  const handleCancel = () => {
    standardForm.resetFields();
    setIsModalVisible(false);
  };

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleEditOk = async () => {
    try {
      const values = await standardForm.validateFields();
      if (selectedStandard && selectedStandard.standard_name) {
        await axios.post("http://localhost:3000/admin/update_standard", {
          standard_name: selectedStandard.standard_name,
          curriculum: values.curriculum,
        });
        standardForm.resetFields();
        setIsEditModalVisible(false);
        fetchStandards();
        message.success("Standard edited successfully");
      } else {
        message.error("Invalid standard data");
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
      message.error("Failed to edit standard");
    }
  };

  const handleEditCancel = () => {
    standardForm.resetFields();
    setIsEditModalVisible(false);
    setSelectedStandard(null);
  };

  const handleDelete = async (standard) => {
    try {
      if (standard && standard.standard_name) {
        await axios.post("http://localhost:3000/admin/delete_standard", {
          standard_name: standard.standard_name,
        });
        fetchStandards();
        message.success("Standard deleted successfully");
      } else {
        message.error("Invalid standard data");
      }
    } catch (error) {
      console.error("Failed to delete standard:", error);
      message.error("Failed to delete standard");
    }
  };

  const showEditModal = (standard) => {
    setSelectedStandard(standard);
    setIsEditModalVisible(true);
  };

  const menu = (standard) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => showEditModal(standard)}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleDelete(standard)}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const filteredStandards = standards.filter(
    (standard) =>
      standard.standard_name &&
      standard.standard_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const redirectToSections = (standard) => {
    navigate(`/classes/sections?standard=${standard.standard_name}`);
  };

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Content style={{ padding: "24px", minHeight: "280px", overflowY: "auto" }}>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Classes</Title>
            <Space>
              <Input
                placeholder="Search Standards"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 500, borderRadius: "50px" }}
              />
            </Space>
          </Space>

          <Button type="primary" icon={<PlusOutlined />} onClick={showModal} style={{ marginTop: 16 }}>
            Add Standard
          </Button>

          <div style={{ maxHeight: "calc(110vh - 280px)", overflowY: "auto" }}>
            <Row gutter={[16, 16]} style={{ padding: "16px", borderRadius: "8px" ,maxWidth: "100%" }}>
              {filteredStandards.map((standard, index) => {
                const standardName = standard.standard_name || 'N/A';

                return (
                  <Col key={index} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      title={<span style={{ fontSize: '25px', fontWeight: 'bold' }}>{romanize(standardName)}</span>}
                      extra={
                        <Dropdown overlay={() => menu(standard)} placement="bottomRight" trigger={['click']}>
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
                      onDoubleClick={() => redirectToSections(standard)}
                    >
                      <p style={{ marginBottom: 0, color: "#666" }}>Curriculum: {standard.curriculum || 'N/A'}</p>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>

          <Modal title="Add Standard" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <Form form={standardForm} layout="vertical" name="standard_form">
              <Form.Item
                name="standardName"
                label="Standard Name"
                rules={[{ required: true, message: "Please input the standard name!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="curriculum"
                label="Curriculum"
                rules={[{ required: true, message: "Please input the curriculum!" }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>

          <Modal title="Edit Standard" visible={isEditModalVisible} onOk={handleEditOk} onCancel={handleEditCancel}>
            <Form form={standardForm} layout="vertical" name="edit_standard_form">
              <Form.Item
                name="curriculum"
                label="Curriculum"
                rules={[{ required: true, message: "Please input the curriculum!" }]}
                initialValue={selectedStandard ? selectedStandard.curriculum : ""}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Classes;
