import React, { useState, useEffect } from "react";
import { Layout, Typography, Space, Table, Button, Modal, Form, Select, message } from "antd";
import Navbar from "../../../components/Navbar/Navbar";
import { useLocation } from "react-router-dom";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const View = () => {
  const location = useLocation();
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedSection, setSelectedSection] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const subjectId = searchParams.get("subject");
  const standardName = searchParams.get("standard");
  const subjectNam = searchParams.get("subjectNam");

  useEffect(() => {
    fetchSections();
    fetchTeachers();
  }, [standardName]);

  const fetchSections = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_section", {
        standard: standardName,
      });

      if (response.data.result && Array.isArray(response.data.result)) {
        setSections(response.data.result);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_teacher");

      if (response.data.message && Array.isArray(response.data.message)) {
        setTeachers(response.data.message);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleAssignTeacher = async (values) => {
    try {
      const { subject_id, teacher_id, section_id } = values;

      const response = await axios.post("http://localhost:3000/admin/create_subjectstaff", {
        subject_id,
        teacher_id,
        section_id,
      });

      console.log("Assigning Teacher - Response:", response.data);

      fetchSections();
      setModalVisible(false);
      form.resetFields();
      message.success("Teacher assigned successfully!");
    } catch (error) {
      console.error("Error assigning teacher:", error);
      message.error("Failed to assign teacher. Please try again.");
    }
  };

  const handleViewSubject = async (sectionId) => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_subjectstaff", {
        section_id: sectionId,
        subject_id: subjectId,
      });

      console.log("View Subject - Response:", response.data);

      if (
        response.data.result &&
        response.data.result.section &&
        Array.isArray(response.data.result.section) &&
        response.data.result.teacher &&
        Array.isArray(response.data.result.teacher)
      ) {
        const subjectDetails = response.data.result.section;
        let teacherDetails = response.data.result.teacher;

        // If teacherDetails is an empty array, set it to null
        teacherDetails = teacherDetails.length > 0 ? teacherDetails : null;

        setSubjectDetails(subjectDetails);
        setTeacherDetails(teacherDetails);

        const teacherId = teacherDetails && teacherDetails.length > 0 ? teacherDetails[0].t_id : '-';
        console.log("Teacher ID:", teacherId);

        const teacherName = teacherDetails && teacherDetails.length > 0 ? teacherDetails[0].t_name : '-';
        console.log("Teacher Name:", teacherName);

        setSelectedSection(sectionId);
      } else {
        setSubjectDetails(null);
      }
    } catch (error) {
      console.error("Error fetching subject details:", error);
      message.error("Failed to fetch subject details. Please try again.");
    }
  };


  const handleDeleteSubjectStaff = async (record) => {
    try {
      console.log("Deleting Subject Staff - Record:", record);

      if (record === null) {
        message.success("Teacher not Assigned!");
      } else {
        const response = await axios.post("http://localhost:3000/admin/delete_subjectstaff", {
          id: record,
        });

        console.log("Delete Subject Staff - Response:", response.data);

        fetchSections();

        message.success("Subject staff deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting subject staff:", error);
      message.error("Failed to delete subject staff. Please try again.");
    }
  };



  const showModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Section Name',
      dataIndex: 'section_name',
      key: 'section_name',
      render: (text, record) => (
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{text.toUpperCase()}</span>
      ),
    },
    {
      title: 'Class Teacher',
      dataIndex: 't_name',
      key: 't_name',
      render: (text, record) => (
        <p style={{ marginBottom: 0, color: "#666" }}>{text || 'N/A'}</p>
      ),
    },
    {
      title: 'View Details',
      dataIndex: 'view_subject',
      key: 'view_subject',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleViewSubject(record.section_id)}>
          View
        </Button>
      ),
    },
  ];

  const subjectColumns = [
    {
      title: 'Subject Name',
      dataIndex: 'subject_name',
      key: 'subject_name',
      render: (text, record) => (
        <span>{subjectNam} {text}</span>
      ),
    },
    {
      title: 'Teacher Name',
      dataIndex: 't_name',
      key: 't_name',
      render: (text, record) => (
        <span>{text ? text : 'Not Assigned'}</span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleDeleteSubjectStaff(record.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Content style={{ padding: '24px', minHeight: '280px' }}>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>{`Sections for ${subjectNam}`}</Title>
            <Button type="primary" onClick={showModal}>
              Assign Teacher
            </Button>
          </Space>

          <div style={{ maxHeight: "calc(110vh - 280px)", overflowY: "auto" }}>
            <Table dataSource={sections} columns={columns} pagination={false} rowKey="section_id" />

            {sections.map((section) => (
              <div key={section.section_id}>
                <Modal
                  title={`Subject Details for ${section.section_name}`}
                  visible={selectedSection === section.section_id}
                  onCancel={() => setSelectedSection(null)}
                  footer={null}
                >
                  {selectedSection === section.section_id && (
                    <>
                      {console.log('Teacher Details:', teacherDetails)}
                      <Table
                        dataSource={teacherDetails || [{ id: null, t_id: null, t_name: null }]}
                        columns={subjectColumns}
                        pagination={false}
                        rowKey="subject_id"
                      />
                    </>
                  )}

                </Modal>
              </div>
            ))};

            <Modal
              title="Assign Teacher to Section"
              visible={modalVisible}
              onCancel={handleCancel}
              footer={null}
            >
              <Form form={form} onFinish={handleAssignTeacher} initialValues={{ subject_id: subjectId }}>
                <Form.Item name="subject_id" hidden />
                <Form.Item
                  name="section_id"
                  label="Section"
                  rules={[{ required: true, message: 'Please select a section!' }]}
                >
                  <Select placeholder="Select a section">
                    {sections.map((section) => (
                      <Option key={section.section_id} value={section.section_id}>
                        {section.section_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="teacher_id"
                  label="Teacher"
                  rules={[{ required: true, message: 'Please select a teacher!' }]}
                >
                  <Select placeholder="Select a teacher">
                    {teachers.map((teacher) => (
                      <Option key={teacher.t_id} value={teacher.t_id}>
                        {teacher.t_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Assign Teacher
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default View;
