import React, { useEffect, useState } from 'react';
import { useNavigate , Router } from 'react-router-dom';
import {
  Table,
  Button,
  Popconfirm,
  message,
  Input,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
} from 'antd';
import axios from 'axios';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
// Import useNavigate
// import { useNavigate } from 'react-router-dom';

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form] = Form.useForm();

  // Initialize navigate
  const navigate = useNavigate();

  // (REMOVED expandable row states: expandedRowKeys, inventoryData)

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/products');
      setProducts(res.data.data);
      setFiltered(res.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  

  // Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/products/${id}`);
      message.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete product');
    }
  };

  // Search filter
  const handleSearch = (value) => {
    setSearchText(value);
    const filteredData = products.filter((p) =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filteredData);
  };

  // Open edit modal
  const openEditModal = (record) => {
    setEditProduct(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // Update product
  const handleUpdate = async (values) => {
    try {
      await axios.put(
        `http://localhost:8000/api/products/${editProduct._id}`,
        values,
        { headers: { 'Content-Type': 'application/json' } }
      );
      message.success('Product updated successfully!');
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update product');
    }
  };

  // (REMOVED expandedRowRender function)

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      // ADD RENDER to make it a link
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/products/${record._id}`)} // Navigate to detail page
        >
          {text}
        </Button>
      ),
    },
    { title: 'Grade', dataIndex: 'materialGrade', key: 'materialGrade' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { title: 'Price/Unit (₹)', dataIndex: 'pricePerUnit', key: 'pricePerUnit' },
    {title:'Weight/Unit(g)' , dataIndex:'weightPerUnit' , key:'weightPerUnit'},
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Edit */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />

          {/* Delete */}
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="primary" icon={<DeleteOutlined />} />
          </Popconfirm>

          {/* (REMOVED "View Inventory" button) */}
        </div>
      ),
    },
  ];

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
        📋 All Products
      </h1>

      {/* Search + Refresh */}
      <Row justify="space-between" style={{ marginBottom: '1rem' }}>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by product name"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '250px', borderRadius: '8px' }}
          />
        </Col>
        <Col>
          <Button onClick={fetchProducts} type="default">
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Table - NO LONGER EXPANDABLE */}
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '1rem',
        }}
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          // (REMOVED expandable prop)
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
        />
      </div>

      {/* Edit Modal (No changes) */}
      <Modal
        title="✏️ Edit Product"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          {/* ... (Your form items are all correct) ... */}
           <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
             <Input />
           </Form.Item>
           <Row gutter={16}>
             <Col span={12}>
               <Form.Item name="materialGrade" label="Material Grade" rules={[{ required: true }]}>
                 <Input />
               </Form.Item>
             </Col>
             <Col span={12}>
               <Form.Item name="type" label="Type">
                 <Input />
               </Form.Item>
             </Col>
           </Row>
           <Row gutter={16}>
             <Col span={12}>
               <Form.Item name="pricePerUnit" label="Price per Unit (₹)">
                 <InputNumber min={0} style={{ width: "100%" }} />
               </Form.Item>
             </Col>
           </Row>
           <Form.Item name="description" label="Description">
             <Input.TextArea rows={2} />
           </Form.Item>
           <Form.Item>
             <Button type="primary" htmlType="submit" block>Update Product</Button>
           </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewProducts;