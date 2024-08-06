import React from "react";
import { Layout, Typography } from "antd";
import Navbar from "../../components/Navbar/Navbar"; 

const { Content } = Layout;
const { Title } = Typography;

const Group = () => {
  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout>
        <Content style={{ padding: '24px', minHeight: '280px' }}>
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default Group;
