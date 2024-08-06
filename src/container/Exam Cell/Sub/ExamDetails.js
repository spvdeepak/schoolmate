import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Modal, Form, DatePicker, Input, Table, Space, message, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import axios from "axios";
import romanize from "romanize";
import moment from "moment";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const ExamDetails = () => {
    const location = useLocation();
    const [examData, setExamData] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [createForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const [searchInput, setSearchInput] = useState("");
    const [subjects, setSubjects] = useState([]);

    const params = new URLSearchParams(location.search);
    const standard_name = params.get("standard");
    console.log("Standard : ", standard_name);

    const fetchExamDetails = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/admin/view_exam`, {
                standard_name: standard_name,
            });
            console.log("Exam Details : ", response.data.message);
            if (response.data && response.data.message) {
                setExamData(response.data.message);
                setFilteredExams(response.data.message);
            } else {
                console.error("Invalid response format:", response);
            }
        } catch (error) {
            console.error("Error fetching exam details:", error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/admin/view_subject`, {
                standard_name: standard_name,
            });

            if (response.data && response.data.message) {
                setSubjects(response.data.message);
            } else {
                console.error("Invalid response format:", response);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    useEffect(() => {
        fetchExamDetails();
        fetchSubjects();
    }, [params.standard_name]);

    const columns = [
        {
            title: 'Exam Name',
            dataIndex: 'e_name',
            key: 'e_name',
        },
        {
            title: 'Standard Name',
            dataIndex: 'standard_name',
            key: 'standard_name',
        },
        {
            title: 'Subjects',
            dataIndex: 'subject_name',
            key: 'subject_name',
        },
        {
            title: 'Exam Date',
            dataIndex: 'e_date',
            key: 'e_date',
            render: (text) => moment(text).format("YYYY-MM-DD"),
        },
        {
            title: 'Academic Year',
            dataIndex: 'acad_year',
            key: 'acad_year',
        },
        {
            title: 'Syllabus',
            dataIndex: 'syllabus',
            key: 'syllabus',
        },
        {
            title: 'Exam Status',
            dataIndex: 'e_date',
            key: 'exam_status',
            render: (text, record) => (
                <span
                    style={{
                        padding: '5px 10px',
                        borderRadius: '5px',
                        color: moment(text).isBefore(moment()) ? '#FFFFFF' : '#000000',
                        backgroundColor: moment(text).isBefore(moment()) ? '#4CAF50' : '#FFD700',
                    }}
                >
                    {moment(text).isBefore(moment()) ? 'Completed' : 'Upcoming'}
                </span>

            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space>
                    <Button type="primary" onClick={() => handleUpdateClick(record)}>
                        Update
                    </Button>
                    <Button type="danger" onClick={() => handleDeleteExam(record.e_id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const handleCreateExam = async (values) => {
        try {
            const createdExams = await Promise.all(subjects.map(async (subject) => {
                const subjectId = subject.subject_id;
                const e_date = values[`e_date_${subjectId}`];
                const syllabus = values[`syllabus_${subjectId}`];


                const response = await axios.post("http://localhost:3000/admin/create_exam", {
                    e_name: values.e_name,
                    standard_name: values.standard_name,
                    acad_year: values.acad_year,
                    subjects: subjectId,
                    e_date: e_date,
                    syllabus: syllabus,
                });

                console.log("Server response:", response.data);

                return response.data.message;
            }));

            setCreateModalVisible(false);
            fetchExamDetails();
            createForm.resetFields();
            message.success("Exams created successfully");

            console.log("Created Exams:", createdExams);
        } catch (error) {
            console.error("Error creating exams:", error);
        }
    };



    const handleUpdateExam = async (values) => {
        try {
            const response = await axios.post("http://localhost:3000/admin/update_exam", values);
            const updatedExam = response.data.message;

            setUpdateModalVisible(false);
            fetchExamDetails();
            updateForm.resetFields();
            message.success("Exam updated successfully");

            console.log("Updated Exam:", updatedExam);
        } catch (error) {
            console.error("Error updating exam:", error);
        }
    };

    const handleDeleteExam = async (e_id) => {
        try {
            await axios.post("http://localhost:3000/admin/delete_exam", { e_id });
            message.success("Exam deleted successfully");
            fetchExamDetails();
        } catch (error) {
            console.error("Error deleting exam:", error);
        }
    };

    const handleUpdateClick = (record) => {
        console.log("Record:", record);

        const subjectsArray = Array.isArray(record.subjects)
            ? record.subjects.map((subject) => subject.subject_id)
            : [record.subjects]; // Assuming it's a single subject as a string

        const initialValues = {
            e_id: record.e_id,
            e_name: record.e_name,
            standard_name: record.standard_name,
            subjects: subjectsArray,
            e_date: moment(record.e_date),
            acad_year: record.acad_year,
            syllabus: record.syllabus,
        };

        // Log the initial values to debug
        console.log("Initial Values:", initialValues);

        // Check if updateForm is available
        console.log("updateForm:", updateForm);

        // Set initial values
        updateForm.setFieldsValue(initialValues);

        setUpdateModalVisible(true);
    };



    const handleSearch = (value) => {
        setSearchInput(value);

        const isEmptySearch = value === null || value.trim() === "";

        setFilteredExams(
            isEmptySearch
                ? examData
                : examData.filter(
                    (exam) =>
                        exam.e_name.toLowerCase().includes(value.toLowerCase()) ||
                        exam.standard_name.toLowerCase().includes(value.toLowerCase()) ||
                        exam.subjects.toLowerCase().includes(value.toLowerCase()) ||
                        exam.acad_year.toLowerCase().includes(value.toLowerCase()) ||
                        exam.syllabus.toLowerCase().includes(value.toLowerCase())
                )
        );
    };

    return (
        <Layout hasSider style={{ minHeight: '100vh' }}>
            <Navbar />

            <Layout>
                <Content style={{ padding: '24px', minHeight: '280px' }}>
                    <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={2}>Exam Details - {romanize(standard_name)}</Title>
                        <Space>
                            <Input
                                placeholder="Search Exam"
                                prefix={<SearchOutlined />}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ width: 500, borderRadius: "50px" }}
                            />
                        </Space>
                    </Space>

                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                        Create Exam
                    </Button>

                    <Table dataSource={filteredExams} columns={columns} rowKey="e_name" />

                    <Modal
                        title="Create Exam"
                        visible={createModalVisible}
                        onOk={() => createForm.submit()}
                        onCancel={() => setCreateModalVisible(false)}
                    >
                        <Form
                            form={createForm}
                            onFinish={handleCreateExam}
                            initialValues={{ standard_name: standard_name }}
                        >
                            <Form.Item label="Exam Name" name="e_name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Standard Name" name="standard_name" rules={[{ required: true }]}>
                                <Input readOnly defaultValue={standard_name} />
                            </Form.Item>
                            {subjects.map(subject => (
                                <React.Fragment key={subject.subject_id}>
                                    <Form.Item label={`${subject.subject_name} - Exam Date`} name={`e_date_${subject.subject_id}`} rules={[{ required: true }]}>
                                        <DatePicker />
                                    </Form.Item>
                                    <Form.Item label={`${subject.subject_name} - Syllabus`} name={`syllabus_${subject.subject_id}`} rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </React.Fragment>
                            ))}
                            <Form.Item label="Academic Year" name="acad_year" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Modal
                        title="Update Exam"
                        visible={updateModalVisible}
                        onOk={() => updateForm.submit()}
                        onCancel={() => setUpdateModalVisible(false)}
                    >
                        <Form
                            form={updateForm}
                            onFinish={(values) => {
                                const { subjects, ...otherValues } = values;
                                handleUpdateExam(otherValues);
                            }}
                        >
                            <Form.Item name="e_id" hidden>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Exam Name" name="e_name" rules={[{ required: true }]}>
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item label="Standard Name" name="standard_name" rules={[{ required: true }]}>
                                <Input readOnly />
                            </Form.Item>
                            <Form.Item label="Subjects" name="subjects" rules={[{ required: true }]}>
                                <Select disabled>
                                    {subjects.map((subject) => (
                                        <Option key={subject.subject_id} value={subject.subject_id}>
                                            {subject.subject_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Exam Date" name="e_date" rules={[{ required: true }]}>
                                <DatePicker />
                            </Form.Item>
                            <Form.Item label="Academic Year" name="acad_year" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Syllabus" name="syllabus" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
};

export default ExamDetails;
