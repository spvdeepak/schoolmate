import React, { useState, useEffect } from "react";
import { Layout, Typography, Select, Table, Row, Col, Card, Tag } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";

import "./Timetable.css"; 

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const Timetable = () => {
  const [standards, setStandards] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/admin/view_standard", {});
      setStandards(response.data.result);
    } catch (error) {
      setError("Error fetching standards");
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (value) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/admin/view_section", {
        standard: value
      });
      setSections(response.data.result);
    } catch (error) {
      setError("Error fetching sections");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async (sectionId) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/admin/view_timetable", {
        sectionId: sectionId
      });
      const groupedTimetable = response.data.reduce((acc, curr) => {
        acc[curr.day] = acc[curr.day] || [];
        acc[curr.day].push(curr);
        return acc;
      }, {});
      setTimetableData(groupedTimetable);
    } catch (error) {
      setError("Error fetching timetable");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectName = async (value) => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_subject", {
        standard_name: value
      });
      setSubjects(response.data.message); // Store subjects in state
    } catch (error) {
      console.error("Error fetching subject name:", error);
    }
  };

  const fetchTeacherName = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_teacher");
      setTeachers(response.data.message); // Store teachers in state
    } catch (error) {
      console.error("Error fetching teacher name:", error);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const handleStandardChange = (value) => {
    setSelectedStandard(value);
    fetchSubjectName(value); // Fetch subjects for the selected standard
    fetchTeacherName(); // Fetch teachers
    fetchSections(value); // Fetch sections for the selected standard
    setSelectedSection("");
  };

  const handleSectionChange = (value) => {
    setSelectedSection(value);
    setLoading(true);
    if (value) {
      fetchTimetable(value);
    } else {
      setLoading(false);
      setTimetableData([]);
    }
  };

  const getColumns = () => {
    let maxPeriod = 0;

    Object.values(timetableData).forEach(periods => {
      periods.forEach(period => {
        if (period.periodno > maxPeriod) {
          maxPeriod = period.periodno;
        }
      });
    });

    const columns = [
      {
        title: "Day",
        dataIndex: "day",
        key: "day",
        align: "center"
      }
    ];

    for (let i = 1; i <= maxPeriod; i++) {
      columns.push({
        title: `Period ${i}`,
        dataIndex: `${i}`,
        key: `${i}`,
        align: "center",
        render: (text, record) => renderPeriod(record, i)
      });
    }

    return columns;
  };

  const renderPeriod = (record, period) => {
    const periodData = record && record[period];
    if (periodData && subjects.length > 0 && teachers.length > 0) {
      const { teacherId, subjectId } = periodData;
      const subject = subjects.find(subject => subject.subject_id === subjectId);
      const teacher = teachers.find(teacher => teacher.t_id === teacherId);
      const teacherName = teacher ? teacher.t_name : "Unknown Teacher";
      const subjectName = subject ? subject.subject_name : "Unknown Subject";
      return (
        <div style={{ marginBottom: 8 }}>
          <Card size="small"> 
            <p style={{ margin: 0 }}>
              <Tag color="#2db7f5">{teacherName}</Tag>
              <Tag color="#87d068">{subjectName}</Tag>
            </p>
          </Card>
        </div>
      );
    } else {
      return <span>No data</span>;
    }
  };


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Content className="timetable-content">
          <Title level={2} className="timetable-title">Timetable</Title>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={12} md={10} lg={8} xl={6} className="select-col">
              <Select
                className="select-standard"
                placeholder="Select Standard"
                onChange={handleStandardChange}
                value={selectedStandard}
                disabled={loading}
              >
                {standards.map(standard => (
                  <Option key={standard.standard_name} value={standard.standard_name}>{standard.standard_name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={10} lg={8} xl={6} className="select-col">
              <Select
                className="select-section"
                placeholder="Select Section"
                onChange={handleSectionChange}
                value={selectedSection}
                disabled={!selectedStandard || loading}
              >
                {sections.map(section => (
                  <Option key={section.section_id} value={section.section_id}>{section.section_name}</Option>
                ))}
              </Select>
            </Col>
          </Row>
          <div className="timetable-table-container">
            {error && <div className="error-message">{error}</div>}
            <div className="table-wrapper">
              <Table
                columns={getColumns()}
                dataSource={daysOrder.map(day => ({
                  key: day,
                  day,
                  ...timetableData[day]?.reduce((acc, curr) => {
                    acc[curr.periodno] = curr;
                    return acc;
                  }, {})
                }))}
                pagination={false}
                loading={loading}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Timetable;
