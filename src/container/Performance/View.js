import React, { useEffect, useState } from "react";
import { Layout, Card, Space, Row, Col, Progress, Table, Dropdown, Menu, Button, Modal } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FundViewOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import { useLocation } from "react-router-dom";
import GraphComponent from '../../components/Graph/Chart';

const { Content } = Layout;

const View = () => {
  const location = useLocation();
  const [chartData, setChartData] = useState([]);
  const [count, setCountData] = useState([]);
  const [standardAverage, setAverage] = useState([]);
  const [sectionDetails, setSectionDetails] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const roundedAverage = Math.floor(standardAverage);
  const params = new URLSearchParams(location.search);
  const standard_name = params.get("standard");

  const fetchStandardAverage = async (standard) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/admin/view_std_avg",
        { standard: standard },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const averages = response.data.message;

      setChartData(averages);

      const totalAverage = averages.reduce((total, subject) => {
        const average = subject.overall_performance !== null ? parseFloat(subject.overall_performance) : 0;
        return total + average;
      }, 0);

      const Average = totalAverage / averages.length;

      setAverage(Average);

    } catch (error) {
      console.error("Error fetching standard averages:", error);
    }
  };

  const fetchCount = async (standard) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/admin/view_performance",
        { standard: standard },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const standardDetails = response.data.message.standard_details;

      const selectedStandardDetails = standardDetails.find(
        (details) => details.standard === standard
      );

      setCountData(selectedStandardDetails || {});

      console.log("Selected Standard Details:", selectedStandardDetails);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    }
  };

  const fetchSections = async (standard) => {
    try {
      console.log(standard);
      const response = await axios.post(
        "http://localhost:3000/admin/view_section",
        { standard: standard },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const sectionList = response.data.result;

      setSections(sectionList);

      console.log("Sections:", sectionList);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchSectionDetails = async (standard, sectionId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/admin/view_section_performance",
        { standard_name: standard, section_id: sectionId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const sectionData = response.data.message
        .map((innerArray) => innerArray.map((student) => ({
          student_id: student.s_id,
          student_name: student.student_name,
          overall_performance: parseFloat(student.overall_performance),
        })))
        .flat();

      const uniqueSectionData = Array.from(new Set(sectionData.map(student => student.student_id)))
        .map(student_id => sectionData.find(student => student.student_id === student_id));

      const sortedSectionData = uniqueSectionData.sort((a, b) => b.overall_performance - a.overall_performance);

      sortedSectionData.forEach((student, index) => {
        student.rank = index + 1;
      });

      setSectionDetails(sortedSectionData);

      console.log("Section Details:", sortedSectionData);
    } catch (error) {
      console.error("Error fetching section details:", error);
    }
  };

  useEffect(() => {
    fetchStandardAverage(standard_name);
    fetchCount(standard_name);
    fetchSections(standard_name);
  }, [standard_name]);

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Performance",
      dataIndex: "overall_performance",
      key: "performance",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
        </Space>
      ),
    },
  ];


  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const fetchStudentMarkDetails = async (standard, studentId) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/admin/view_student_mark",
        { standard: standard, s_id: studentId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const studentMarkDetails = response.data.message;
      console.log(studentMarkDetails);

      const processedData = studentMarkDetails.map((entry) => {
        const hasMultipleSubjects = entry.individual_scores.includes(',');

        let subjectData = [];

        if (hasMultipleSubjects) {
          subjectData = entry.individual_scores.split(',').map((score) => {
            const [subject, individual_score] = score.split(':').map((item) => item.trim());
            return { subject, individual_score: parseInt(individual_score, 10) };
          });
        } else {
          subjectData = [{ subject: entry.subject_names, individual_score: parseInt(entry.individual_scores, 10) }];
        }

        return {
          exam_name: entry.exam_name,
          individual_scores: entry.individual_scores,
          overall_score: entry.overall_score,
          subject_names: entry.subject_names,
          subject_data: subjectData,
        };
      });

      console.log("Processed Data:", processedData);

      setModalData(processedData);
      showModal();
    } catch (error) {
      console.error("Error fetching student mark details:", error);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedStudent(record);
    fetchStudentMarkDetails(standard_name, record.student_id);
  };

  const menu = (
    <Menu onClick={(e) => handleSectionSelect(e)}>
      {sections.map((section) => (
        <Menu.Item key={section.section_id}>{section.section_name}</Menu.Item>
      ))}
    </Menu>
  );

  const handleSectionSelect = ({ key }) => {
    setSelectedSection(key);
    fetchSectionDetails(standard_name, key);
  };

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout style={{ maxHeight: "100vh", overflowY: "auto" }} >
        <Content style={{ padding: "24px" }}>
          <Row gutter={[16, 32]}>
            <Col span={8}>
              <Card title="Average" style={{ marginBottom: "16px", boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Progress percent={roundedAverage} status="active" style={{ maxHeight: '50px' }} />
              </Card>
              <Card title="Standard Details" style={{ marginBottom: "16px", boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Row gutter={[16, 32]} justify="center">
                  <Col span={24}>
                    <Space direction="horizontal" align="center">
                      <div style={{ background: '#1890ff', padding: '8px', borderRadius: '8px' }}>
                        <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1, paddingLeft: '16px' }}>
                        <div>Total Students</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{count.total_students}</div>
                      </div>
                    </Space>
                  </Col>
                </Row>
                <Row gutter={[16, 32]} justify="center">
                  <Col span={24}>
                    <Space direction="horizontal" align="center">
                      <div style={{ background: '#52c41a', padding: '8px', borderRadius: '8px' }}>
                        <TeamOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1, paddingLeft: '16px' }}>
                        <div>Total Sections</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{count.num_sections}</div>
                      </div>
                    </Space>
                  </Col>
                </Row>
                <Row gutter={[16, 32]} justify="center">
                  <Col span={24}>
                    <Space direction="horizontal" align="center">
                      <div style={{ background: '#eb2f96', padding: '8px', borderRadius: '8px' }}>
                        <BookOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1, paddingLeft: '16px' }}>
                        <div>Total Subjects</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{count.total_subjects}</div>
                      </div>
                    </Space>
                  </Col>
                </Row>
                <Row gutter={[16, 32]} justify="center">
                  <Col span={24}>
                    <Space direction="horizontal" align="center">
                      <div style={{ background: 'rgb(255, 0, 0)', padding: '8px', borderRadius: '8px' }}>
                        <FundViewOutlined style={{ fontSize: '24px', color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1, paddingLeft: '16px' }}>
                        <div>Total Exams</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{count.total_exams}</div>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={16}>
              <Card title="Graph " style={{
                height: "470px", boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff',
              }} headStyle={{ backgroundColor: '#2196F3', color: 'white' }}>
                <GraphComponent data={chartData} graphType="bar" />
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 32]}>
            <Col span={24}>
              <Card title="Section Details" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Dropdown overlay={menu} trigger={['click']}>
                  <Button>
                    {selectedSection ? `Selected Section: ${sections.find(section => section.section_id === selectedSection)?.section_name}` : 'Select Section'}
                  </Button>
                </Dropdown>
                {selectedSection && (
                  <>
                    <Table columns={columns} dataSource={sectionDetails} />
                    <GraphComponent data={sectionDetails} graphType="sinusoidal-section" />
                  </>
                )}

              </Card>
            </Col>
          </Row>
          <Modal
            title={`Student Mark Details - ${selectedStudent ? selectedStudent.student_name : ''}`}
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={1300}
          >
            <GraphComponent data={modalData} graphType="sinusoidal-student" />
            <Table
              columns={[
                {
                  title: "Exam Name",
                  dataIndex: "exam_name",
                  key: "exam_name",
                },
                {
                  title: "Subject Names",
                  dataIndex: "subject_names",
                  key: "subject_names",
                },
                {
                  title: "Overall Score",
                  dataIndex: "overall_score",
                  key: "overall_score",
                },
                {
                  title: "Individual Scores",
                  dataIndex: "individual_scores",
                  key: "individual_scores",
                },
              ]}
              dataSource={modalData}
              pagination={false}
            />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default View;
