import React, { useState, useEffect } from 'react';
import { Badge, Calendar, Modal, Card, Skeleton, Form, Input, Button, message, Radio } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Calendar.css';

const { Meta } = Card;

const AdvancedCalendar = () => {
  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.post('http://localhost:3000/admin/view_event');
      const data = response.data;
      console.log(data);
      setEventsData(data.events);
    } catch (error) {
      console.error('Error fetching events data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const getListData = (value) => {
    const date = value.format('YYYY-MM-DD');
    const eventData = eventsData.find((event) => event.date === date);

    return eventData
      ? [
        {
          type: mapStatusToBadgeType(eventData.status),
          content: eventData.event,
        },
      ]
      : [];
  };

  const mapStatusToBadgeType = (status) => {
    switch (status) {
      case '0':
        return 'error';
      case '1':
        return 'success';
      case '2':
        return 'warning';
      default:
        return 'success';
    }
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index} onClick={() => handleEventClick(item.content, item.color, value)}>
            <Badge status={item.type} text={item.content} color={item.color} />
          </li>
        ))}
      </ul>
    );
  };

  const handleEventClick = (eventContent, color, date) => {
    setSelectedEvent({ content: eventContent, color, date });
    setIsEditMode(false);
    setModalVisible(true);
  };

  const handleEdit = () => {
    form.setFieldsValue({ event: selectedEvent.content, status: selectedEvent.status });
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      console.log('Deleting event:', selectedEvent.content);

      const response = await axios.post('http://localhost:3000/admin/delete_event', {
        date: selectedEvent.date.format('YYYY-MM-DD'),
      });

      console.log('Delete response:', response.data);

      message.success('Event deleted successfully');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      message.error('Failed to delete event');
    }
  };

  const handleUpdate = async (values) => {
    try {
      console.log('Updating event:', selectedEvent.content);

      const response = await axios.post('http://localhost:3000/admin/update_event', {
        date: selectedEvent.date.format('YYYY-MM-DD'),
        event: values.event,
        status: values.status,
      });

      console.log('Update response:', response.data);

      message.success('Event updated successfully');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error updating event:', error);
      message.error('Failed to update event');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setIsEditMode(false);
    form.resetFields();
  };

  return (
    <>
      <Calendar
        style={{ width: '100%', height: '100%', maxHeight: '10vh' }}
        cellRender={dateCellRender}
      />
      <Modal
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedEvent && (
          <>
            <Card
              style={{ width: 300, marginTop: 16 }}
              loading={loading}
              actions={[
                <EditOutlined key="edit" onClick={handleEdit} />,
                <DeleteOutlined key="delete" onClick={handleDelete} />,
              ]}
            >
              <Skeleton loading={loading}>
                <Meta title="Events" description={selectedEvent.content} />
                {isEditMode && (
                  <Form
                    form={form}
                    onFinish={handleUpdate}
                    initialValues={{ event: selectedEvent.content, status: selectedEvent.status }}
                    style={{ marginTop: '16px' }}
                  >
                    <Form.Item
                      name="event"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the event',
                        },
                      ]}
                    >
                      <Input placeholder="Event" />
                    </Form.Item>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[
                        {
                          required: true,
                          message: 'Please select the status',
                        },
                      ]}
                    >
                      <Radio.Group className="radio-group">
                        <Radio value="0" className="radio-button error">Holidays</Radio>
                        <Radio value="1" className="radio-button success">Important</Radio>
                        <Radio value="2" className="radio-button warning">Programs</Radio>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Update
                      </Button>
                    </Form.Item>
                  </Form>
                )}
              </Skeleton>
            </Card>
          </>
        )}
      </Modal>
    </>
  );
};

export default AdvancedCalendar;
