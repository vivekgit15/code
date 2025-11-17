import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MonthlyChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/dashboard/monthly-stats');
        setData(res.data.data);
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
      }
    };
    fetchMonthlyStats();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalIn" fill="#82ca9d" name="Stock IN" />
        <Bar dataKey="totalOut" fill="#8884d8" name="Stock OUT" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
