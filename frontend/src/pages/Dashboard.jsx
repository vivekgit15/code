import React from 'react';
import { Row, Col, Card } from 'antd';
// import Loader from '../components/Loader';
import DailyChart from '../components/DailyChart';
import MonthlyChart from '../components/MonthlyChart';
import axios from 'axios';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard summary
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/dashboard/summary');
        setSummary(res.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

//   if (loading) return <Loader />;

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
          color:'black',
        }}
      >
        📊 Inventory Dashboard
      </h1>

      {/* Summary Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '2rem' }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderRadius: '10px',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <h3 style={{ color: '#555' }}>Total Products</h3>
            <h1 style={{ fontSize: '2rem', color: '#1677ff' }}>
              {summary?.totalProducts || 0}
            </h1>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderRadius: '10px',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <h3 style={{ color: '#555' }}>Total Stock</h3>
            <h1 style={{ fontSize: '2rem', color: '#16a34a' }}>
              {summary?.totalStock || 0}
            </h1>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          {/* <Card
            style={{
              background: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderRadius: '10px',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <h3 style={{ color: '#555' }}>Total OUT</h3>
            <h1 style={{ fontSize: '2rem', color: '#e11d48' }}>
              {summary?.totalOut || 0}
            </h1>
          </Card> */}
        

        {/* <Col xs={24} sm={12} md={6}> */}
          <Card
            style={{
              background: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderRadius: '10px',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <h3 style={{ color: '#555' }}>Current Stock Value</h3>
           <h1 style={{ fontSize: '2rem', color: '#fb923c' }}>
  {summary?.totalStockValue?.toFixed(2) || 0}
</h1>

          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      {/* <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          📅 Daily Stock Movement
        </h2>
        <DailyChart />
      </div>

      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          📆 Monthly Stock Summary
        </h2>
        <MonthlyChart />
      </div> */}
    </div>
  );
};

export default Dashboard;
