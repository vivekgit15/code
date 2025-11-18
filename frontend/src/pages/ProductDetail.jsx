import React, { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';
import {
  Table,
  Card,
  Spin,
  message,
  Breadcrumb,
  Descriptions,
  Button,
  Tag,
} from 'antd';
import { HomeOutlined, CarryOutOutlined } from '@ant-design/icons';
import axios from 'axios';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        
        const productReq = axios.get(`${backendUrl}/products/${id}`);
        const inventoryReq = axios
          .get(`${backendUrl}/inventory/product/${id}`)
          .catch(async (err) => {
            
            return axios.get(`${backendUrl}/inventory?product=${id}`);
          });

        const [productRes, inventoryRes] = await Promise.all([productReq, inventoryReq]);

        // normalize product
        const prod = productRes?.data?.data ?? productRes?.data ?? null;
        setProduct(prod);

        // normalize inventory response to an array (handles multiple response shapes)
        const invPayload = inventoryRes?.data;
        let invList = [];
        if (Array.isArray(invPayload)) {
          invList = invPayload;
        } else if (Array.isArray(invPayload?.data)) {
          invList = invPayload.data;
        } else if (Array.isArray(invPayload?.items)) {
          invList = invPayload.items;
        } else if (Array.isArray(invPayload?.inventory)) {
          invList = invPayload.inventory;
        } else {
          invList = [];
        }

        setInventory(invList);

        
      } catch (error) {
        message.error('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]); // Re-run if the 'id' in the URL changes

  // Columns for the INVENTORY table
  const inventoryColumns = [
    { title: 'Lot No', dataIndex: 'lotNumber', key: 'lotNumber' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    {title:'Location' , dataIndex:'location' , key:'location'},
    
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        // This button sets up the NEXT level: Inventory -> Transactions
        <Button
          icon={<CarryOutOutlined />}
          onClick={() => navigate(`/inventory/${record._id}`)}
        >
          View Transactions
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" style={{ margin: 'auto', display: 'block' }} />;
  }

  if (!product) {
    return <h1>Product not found.</h1>;
  }

  return (
    <div
      style={{
        width: '93vw',
        minHeight: '100vh',
        background: '#f7f9fc',
        padding: '2rem',
      }}
    >
      {/* Navigation Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '1rem' }}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /></Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/view-products">Products</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Card for Product Master Info */}
      <Card
        title={`Product Details: ${product.name}`}
        style={{
          marginBottom: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Product ID">{product._id}</Descriptions.Item>
          <Descriptions.Item label="Material Grade">
            {product.materialGrade}
          </Descriptions.Item>
          <Descriptions.Item label="Type">{product.type}</Descriptions.Item>
          <Descriptions.Item label="Unit">{product.unit}</Descriptions.Item>
          <Descriptions.Item label="Price/Unit">
            ₹{product.pricePerUnit}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {product.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Table for Inventory */}
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '1rem',
        }}
      >
        <h2 style={{ marginBottom: '1rem' , color:'black' }}>
      Inventory for {product.name}
        </h2>
        <Table
          columns={inventoryColumns}
          dataSource={inventory}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default ProductDetails;