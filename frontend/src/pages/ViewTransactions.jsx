import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Row, Col, Input, Button, Tooltip } from 'antd';
import axios from 'axios';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const ViewTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/transactions');

      // Normalize response to an array (handles res.data or res.data.data shapes)
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setTransactions(list);
      setFiltered(list);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter by product name
  const handleSearch = (value) => {
    setSearchText(value);
    const filteredData = transactions.filter((transaction) =>
      transaction.inventory?.product?.name
        ?.toLowerCase()
        .includes(value.toLowerCase())
    );
    setFiltered(filteredData);
  };

  // Define table columns
  const columns = [
    {
      title: "Product Name",
     
      key: "productName",
      render: (_, record) => {
      if (!record.inventory) {
        return <Tag color="red">Inventory Deleted</Tag>;
      }
    
      return record.inventory?.product?.name || "-";
    }
      // sorter: (a, b) => {
      //   const A = a.inventory?.product?.name || '';
      //   const B = b.inventory?.product?.name || '';
      //   return A.localeCompare(B);
      
      // }
    },
    {
      title: 'Material Grade',
      key: 'materialGrade',
      render: (_, record) => record.inventory?.product?.materialGrade || '-'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'IN' ? 'green' : 'volcano'}>
          {type === 'IN' ? 'IN (Added)' : 'OUT (Dispatched)'}
        </Tag>
      ),
    },
    {
      title: 'Lot Number',
      key: 'lotNumber',
      render: (_, record) => record.inventory?.lotNumber || '-'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (remarks) =>
        remarks ? (
          <Tooltip title={remarks}>
            {remarks.length > 25 ? remarks.substring(0, 25) + '...' : remarks}
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
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
          color:"black"
        }}
      >
        📊 All Stock Transactions
      </h1>

      <Row justify="space-between" style={{ marginBottom: '1rem' }}>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by inventory name"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '250px',
              borderRadius: '8px',
            }}
          />
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchTransactions}
            type="default"
          >
            Refresh
          </Button>
        </Col>
      </Row>

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
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
};

export default ViewTransactions;
