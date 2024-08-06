import React, { useState, useEffect } from "react";
import { Layout, Typography, Space, Input, Card, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import romanize from "romanize";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

const Exam = () => {
  const [standards, setStandards] = useState([]);
  const [filteredStandards, setFilteredStandards] = useState([]);
  const navigate = useNavigate();

  const fetchStandards = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_standard");

      if (response.data.result && Array.isArray(response.data.result)) {
        setStandards(response.data.result);
        setFilteredStandards(response.data.result);
      } else {
        setStandards([]);
        setFilteredStandards([]);
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const handleSearch = (value) => {
    const filtered = standards.filter((standard) =>
      standard.standard_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStandards(filtered);
  };

  const redirectToSections = (standard) => {
    navigate(`/exam/details?standard=${standard.standard_name}`);
  };


  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout>
        <Content style={{ padding: '24px', minHeight: '280px' }}>
          <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Exams Standard</Title>
            <Space>
              <Input
                placeholder="   Search Standard"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 500, borderRadius: "50px" }}
              />
            </Space>
          </Space>

          <div style={{ maxHeight: "calc(110vh - 280px)", overflowY: "auto" }}>
            <Row gutter={[16, 16]} style={{ padding: "16px", borderRadius: "8px", maxWidth: "100%" }}>
              {filteredStandards.map((standard, index) => {
                const standardName = standard.standard_name || 'N/A';

                return (
                  <Col key={index} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      title={<span style={{ fontSize: '25px', fontWeight: 'bold' }}>{romanize(standardName)}</span>}
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default Exam;
