import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Row, Col } from 'antd';
import axios from 'axios';

const { Option } = Select;

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const onFinish = async (values) => {
    const cleanData = {
      ...values,
      brand: values.brand || '',
      thickness: values.thickness || 0,
      diameter: values.diameter || 0,
      length: values.length || 0,
      description: values.description || ''
    };

    // Replace undefined or empty with null
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === '' || cleanData[key] === undefined) {
        cleanData[key] = null;
      }
    });

    try {
      setLoading(true);
      await axios.post(`${backendUrl}/products`, cleanData, {
        headers: { 'Content-Type': 'application/json' }
      });
      message.success('Product created successfully!');
      form.resetFields(); // clear inputs after success
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '93vw',
        minHeight: '100vh',
        background: '#f7f9fc',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'black',
        }}
      >
     Add New Steel Product
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: '100%',
        }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              label="Product Name"
              name="name"
              rules={[{ required: true, message: 'Please enter product name' }]}
            >
              <Input placeholder="e.g. MS Round Bar" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              label="Material Grade"
              name="materialGrade"
              rules={[{ required: true, message: 'Please enter material grade' }]}
            >
              <Input placeholder="e.g. EN8, SS304" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: 'Please enter product type' }]}
            >
              <Input placeholder="e.g. Flat, Round Bar, Pipe" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label="Brand" name="brand">
              <Input placeholder="e.g. Tata Steel, Jindal" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Thickness (mm)" name="thickness">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 10" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Diameter (mm)" name="diameter">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 25" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Length (m)" name="length">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 6" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Width (m)" name="width">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 5" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item
              label="Price per Unit (₹)"
              name="pricePerUnit"
              rules={[{ required: true, message: 'Enter price per unit' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 80" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item
              label="Weight per Unit (g)"
              name="weightPerUnit"
              rules={[{ required: true, message: 'Enter weight per unit' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 80" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item
              label="Unit"
              name="unit"
              required="true"

            >
              
              <Select placeholder="Select type">
                <Option value="KG">KG (Kilogram)</Option>
                <Option value="PIECES">PIECES</Option>
                <Option value="METER">METER</Option>
                <Option value="MM">MM (Millimeter)</Option>
                <Option value="FEET">FEET</Option>
                <Option value="METRIC TON">METRIC TON</Option>
                <Option value="QUINTAL">QUINTAL</Option>

              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={2} placeholder="Short product description..." />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              width: '250px',
              height: '45px',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            Add Product
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddProduct;
