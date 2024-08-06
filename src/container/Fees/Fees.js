import React, { useState, useEffect } from "react";
import { Layout, Typography, Drawer, Card, Button, Row, Col, Table, Modal, Form, Input, Space } from "antd";
import romanize from "romanize";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;

const Fees = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [form] = Form.useForm();
  const [formFields, setFormFields] = useState([]);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const fetchStandards = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_standard", {});

      if (response.data && Array.isArray(response.data.result)) {
        setStandards(response.data.result.map((standard) => standard.standard_name));
      } else {
        console.error("Invalid data format for standards:", response.data.result);
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
    }
  };

  const fetchStudentFees = async (standard) => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_studentsfee", {
        standard,
      });

      if (response.data && Array.isArray(response.data.fees)) {
        setStudentFees(response.data.fees);
        console.log(response.data.fees);
      } else {
        console.error("Invalid data format for student fees:", response.data);
      }
    } catch (error) {
      console.error("Error fetching student fees:", error.message);
    }
  };

  const handleCardClick = (selectedStandard) => {
    setSelectedStandard(selectedStandard);
    onCloseDrawer();
    fetchStudentFees(selectedStandard);
    fetchStudentNames();
  };

  const fetchStudentNames = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_studentall", {});

      if (response.data && Array.isArray(response.data.result)) {
        setStudents(response.data.result);
      } else {
        console.error("Invalid data format for all student names:", response.data);
      }
    } catch (error) {
      console.error("Error fetching all student names:", error.message);
    }
  };

  const handleUpdate = (studentId) => {
    const selectedStudent = studentFees.find((item) => item.s_id === studentId);
    setSelectedStudentId(studentId);

    const formFields = Object.keys(selectedStudent)
      .slice(2)
      .map((field) => ({
        name: field,
        label: field.charAt(0).toUpperCase() + field.slice(1),
      }));

    setFormFields(formFields);
    form.setFieldsValue(selectedStudent);
    setUpdateModalVisible(true);
  };

  const calculateTotalFees = (record) => {
    const totalFees = Object.values(record).slice(2).reduce((total, value) => total + value, 0);
    return totalFees;
  };

  const calculateFormFieldsTotal = () => {
    const total = formFields.reduce((sum, { name }) => sum + form.getFieldValue(name), 0);
    return total;
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      const response = await axios.post("http://localhost:3000/admin/update_student_fee", {
        values,
        s_id: selectedStudentId,
      });

      console.log("Server response:", response.data);

      if (response.data && response.data.message === 'Successfully updated') {
        console.log("Update successful");

        await fetchStudentFees(selectedStandard);
        await fetchStudentNames();
      } else {
        console.error("Update failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating student fees:", error.message);
    } finally {
      setUpdateModalVisible(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  useEffect(() => {
    if (selectedStandard) {
      fetchStudentFees(selectedStandard);
      fetchStudentNames();
    }
  }, [selectedStandard]);

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout>
        <Content style={{ padding: "24px", minHeight: "280px" }}>
          <Title level={3}>Fees </Title>

          <Button type="primary" onClick={showDrawer}>
            Select Standards
          </Button>

          <Drawer
            title="Select Standards"
            placement="right"
            closable={true}
            onClose={onCloseDrawer}
            visible={drawerVisible}
            width={500}
          >
            <Row gutter={[16, 16]}>
              {standards.map((standard, index) => (
                <Col key={index} span={8}>
                  <Card
                    hoverable
                    style={{
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      borderRadius: "10px",
                      textAlign: "center",
                      padding: "16px",
                      height: "120px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    onClick={() => handleCardClick(standard)}
                  >
                    <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                      {romanize(standard)}
                    </span>
                  </Card>
                </Col>
              ))}
            </Row>
          </Drawer>

          {studentFees.length > 0 && selectedStandard && (
            <div>
              <Title level={4}>Students of Standard {romanize(selectedStandard)}</Title>
              <Table
                dataSource={studentFees}
                columns={[
                  {
                    title: 'Student Name',
                    dataIndex: 's_id',
                    key: 's_id',
                    render: (s_id) => (
                      <span>
                        {students.find((student) => student.s_id === s_id)?.s_name || 'N/A'}
                      </span>
                    ),
                  },
                  {
                    title: 'Total Fees',
                    key: 'totalFees',
                    render: (text, record) => (
                      <span>
                        {calculateTotalFees(record)}
                      </span>
                    ),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    render: (text, record) => (
                      <Space size="middle">
                        <Button type="primary" onClick={() => handleUpdate(record.s_id)}>
                          Update
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                pagination={{
                  pageSize: 6,
                }}
              />
            </div>
          )}

          <Modal
            title={`Update Student Fees for ${students.find((student) => student.s_id === selectedStudentId)?.s_name || 'N/A'}`}
            visible={updateModalVisible}
            onOk={handleUpdateSubmit}
            onCancel={() => setUpdateModalVisible(false)}
          >
            <Form form={form}>
              {formFields.map(({ name, label }) => (
                <Item key={name} name={name} label={label}>
                  <Input type="number" />
                </Item>
              ))}
            </Form>
            <div style={{ marginTop: '16px' }}>
              <strong>Total Fees:</strong> {calculateFormFieldsTotal()}
            </div>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Fees;
