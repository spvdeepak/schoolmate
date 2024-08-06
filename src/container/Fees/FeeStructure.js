import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Drawer, Form, Input, Row, Col, Card, message, FloatButton } from "antd";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import romanize from "romanize";

const { Content } = Layout;
const { Title } = Typography;

const Structure = () => {
  const [isCreateDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [isViewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [createFeesStructure, setCreateFeesStructure] = useState({
    numFields: 1,
    fields: {},
  });
  const [standards, setStandards] = useState([]);
  const [feesStructure, setFeesStructure] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_standard");

      if (response.data && Array.isArray(response.data.result)) {
        const romanizedStandards = response.data.result.map(standard => ({
          ...standard,
          standard_name: standard.standard_name,
        }));

        setStandards(romanizedStandards);
      } else {
        console.error("Invalid data format for standards:", response.data.result);
      }
    } catch (error) {
      console.error("Error fetching standards:", error.message);
    }
  };

  const showCreateDrawer = () => {
    setCreateDrawerVisible(true);
  };

  const onCloseCreateDrawer = () => {
    setCreateDrawerVisible(false);
    setCreateFeesStructure({
      numFields: 1,
      fields: {},
    });
  };

  const handleCreateStructure = async (values) => {
    console.log('Form values:', values);
    try {
      const fields = Object.values(values.fields).slice(1);
      const concatenatedFields = fields.join(',');

      console.log('Request:', {
        Fields: concatenatedFields,
      });

      const response = await axios.post(
        "http://localhost:3000/admin/create_fees",
        { Fields: concatenatedFields },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Response:', response.data);

      message.success("Fees structure created successfully!");
      onCloseCreateDrawer();
      fetchStandards();
    } catch (error) {
      message.error("Error creating fees structure");
      console.error("Error creating fees structure:", error.message);
    }
  };

  const generateFieldsInputs = (formValues, prefix) => {
    const fieldsInputs = [];

    for (let i = 0; i < formValues.numFields; i++) {
      const fieldName = `field${i + 1}`;
      fieldsInputs.push(
        <Form.Item
          key={i}
          label={`Field ${i + 1}`}
          name={[prefix, fieldName]}
          rules={[{ required: true, message: 'Please enter the field!' }]}
        >
          <Input placeholder={`Enter field ${i + 1}`} />
        </Form.Item>
      );
    }

    return fieldsInputs;
  };

  const handleStandardClick = async (standard) => {
    setSelectedStandard(standard);
    setFeesStructure([]);
    viewFeesStructure(standard);
    setViewDrawerVisible(true);
    form.resetFields();
  };

  const viewFeesStructure = async (standard) => {
    try {
      const response = await axios.post("http://localhost:3000/admin/view_standard_feestructure", {
        standard,
      });

      if (response.data && Array.isArray(response.data.fees)) {
        setFeesStructure(response.data.fees);
        console.log(response.data.fees);
      } else {
        console.error("Invalid data format for fees structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching fees structure:", error.message);
    }
  };

  const onCloseViewDrawer = () => {
    setFeesStructure([]);
    setViewDrawerVisible(false);
    form.resetFields(); // Reset form values when closing the drawer
  };

  const handleUpdateFees = async () => {
    try {
      const valuesToUpdate = {};

      feesStructure.forEach((fee, index) => {
        valuesToUpdate[fee.feetype] = form.getFieldValue(`fees[${index}].value`);
      });

      const response = await axios.post(
        "http://localhost:3000/admin/update_fee",
        {
          values: valuesToUpdate,
          standard: selectedStandard,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Update Response:', response.data);
      message.success("Fees updated successfully!");
    } catch (error) {
      message.error("Error updating fees");
      console.error("Error updating fees:", error.message);
    }
  };

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Navbar />

      <Layout>
        <Content style={{ padding: '24px', minHeight: '280px' }}>

          <FloatButton tooltip={<div>Fees Structure</div>} onClick={showCreateDrawer} icon={<PlusOutlined />} />

          <Row gutter={[16, 16]}>
            {standards.map((standard, index) => (
              <Col key={index} span={8} onClick={() => handleStandardClick(standard.standard_name)}>
                <Card title={romanize(standard.standard_name)}>
                  <p>Curriculum: {standard.curriculum}</p>
                </Card>
              </Col>
            ))}
          </Row>

          <Drawer
            title="Create Fees Structure"
            width={500}
            onClose={onCloseCreateDrawer}
            visible={isCreateDrawerVisible}
            forceRender={true}
          >
            <Form
              layout="vertical"
              form={form}
            >
              <Form.Item
                label="Number of Fields"
                name={['fields', 'numFields']}
                initialValue={1}
              >
                <Input
                  type="number"
                  min={1}
                  onChange={(e) => setCreateFeesStructure({
                    ...createFeesStructure,
                    numFields: parseInt(e.target.value),
                  })}
                />
              </Form.Item>

              {generateFieldsInputs(createFeesStructure, 'fields')}

              <Form.Item>
                <Button type="primary" onClick={() => handleCreateStructure(form.getFieldsValue())}>
                  Create Structure
                </Button>
              </Form.Item>
            </Form>
          </Drawer>

          <Drawer
            title={`Fees Structure for ${romanize(selectedStandard)}`}
            width={500}
            onClose={onCloseViewDrawer}
            visible={isViewDrawerVisible}
            forceRender={true}
          >
            <Form layout="vertical" form={form}>
              {selectedStandard && (
                <div>
                  {feesStructure.map((fee, index) => (
                    <div key={index}>
                      <Form.Item label={` ${fee.feetype}`} name={`fees[${index}].value`} initialValue={fee.value}>
                        <Input placeholder={`Enter Fee value  ${fee.feetype}`} />
                      </Form.Item>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="primary" onClick={handleUpdateFees}>
                      Update
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form>
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Structure;
