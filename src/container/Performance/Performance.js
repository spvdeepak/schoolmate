import React, { useEffect, useState } from "react";
import { Layout, Typography, Row, Col, Card, Avatar, Divider, Progress } from "antd";
import axios from "axios";
import romanize from "romanize";
import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from 'react-router-dom';
import './Performance.css';

const { Content } = Layout;
const { Title } = Typography;

const Performance = () => {
  const [standards, setStandards] = useState([]);
  const navigate = useNavigate();

  const fetchStandards = async () => {
    try {
      const responseStandards = await axios.post("http://localhost:3000/admin/view_standard");

      if (responseStandards.data.result && Array.isArray(responseStandards.data.result)) {
        const allStandardsData = await Promise.all(responseStandards.data.result.map(async (standard) => {
          try {
            const responsePerformance = await axios.post("http://localhost:3000/admin/view_perform");

            if (responsePerformance.data.message && Array.isArray(responsePerformance.data.message.standard_details)) {
              const matchingStandard = responsePerformance.data.message.standard_details.find(
                (s) => s.standard === standard.standard_name
              );

              if (matchingStandard) {
                const responseOverallPerformance = await axios.post("http://localhost:3000/admin/view_std_avg", {
                  standard: standard.standard_name
                });

                let overallPerformance = 0;
                let sectionCount = 0;

                if (responseOverallPerformance.data.message && Array.isArray(responseOverallPerformance.data.message)) {
                  responseOverallPerformance.data.message.forEach((item) => {
                    if (item.section_name) {
                      sectionCount++; 
                    }
                  });
                  overallPerformance = responseOverallPerformance.data.message.reduce((total, item) => {
                    if (item.overall_performance && !isNaN(parseFloat(item.overall_performance))) {
                      return total + parseFloat(item.overall_performance);
                    }
                    return total;
                  }, 0);
                }

                const averageOverallPerformance = sectionCount !== 0 ? overallPerformance / sectionCount : 0;

                const studentCount = responsePerformance.data.message.section_details.reduce((total, section) => {
                  if (section.standard === standard.standard_name) {
                    return total + section.student_count;
                  }
                  return total;
                }, 0);

                const standardData = {
                  ...standard,
                  performance: matchingStandard,
                  studentCount: studentCount,
                  overallPerformance: averageOverallPerformance,
                };

                return standardData;
              } else {
                return {
                  ...standard,
                  performance: null,
                  studentCount: 0,
                  overallPerformance: 0,
                };
              }
            } else {
              return {
                ...standard,
                performance: null,
                studentCount: 0,
                overallPerformance: 0,
              };
            }
          } catch (error) {
            console.error("Error fetching performance:", error);
            return {
              ...standard,
              performance: null,
              studentCount: 0,
              overallPerformance: 0,
            };
          }
        }));

        setStandards(allStandardsData);
      } else {
        setStandards([]);
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
    }
  };

  const redirectToSections = (standard) => {
    navigate(`/performance/perform-view?standard=${standard.standard_name}`);
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout style={{ maxHeight: "100vh", overflowY: "auto" }}>
        <Content style={{ padding: "24px", overflow: "auto" }}>
          <Title level={3}>Standards</Title>
          <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
            {standards.map((standard) => (
              <Col key={standard.id} xs={24} sm={12} md={12} lg={12}>
                <Card className="custom-card" onDoubleClick={() => redirectToSections(standard)}>
                  <div className="avatar-container">
                    <Avatar size={70} className="custom-avatar">
                      {romanize(standard.standard_name)}
                    </Avatar>
                  </div>
                  <div className="card-content">
                    <p className="card-text">
                      <span className="text-label">Sections:</span>
                      {standard.performance && standard.performance.section_names ? (
                        <div className="section-container" style={{ display: 'flex', alignItems: 'center' }}>
                          {standard.performance.section_names.split(',').map((section, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginRight: '2px' }}>
                              <Avatar size={40} className="custom-avatar">
                                {section.trim()}
                              </Avatar>
                              <span style={{ marginLeft: '8px' }}>{standard.performance[section.trim()]}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        "No sections available"
                      )}
                    </p>
                    <p className="card-text">
                      <span className="text-label">Total Students:</span> {standard.studentCount}
                    </p>
                    <Divider style={{ borderTop: '1px solid #d3d3d3' }} />

                    <div className="progress-container">
                      <Typography.Text strong className="progress-label">
                        Average
                      </Typography.Text>
                      <Progress
                        percent={Math.round(standard.overallPerformance)}
                        status="active"
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Performance;
