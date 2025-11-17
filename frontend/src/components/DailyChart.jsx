import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DailyChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/dashboard/daily-stats');
        setData(res.data.data);
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
    };
    fetchDailyStats();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="in" stroke="#82ca9d" name="Stock IN" />
        <Line type="monotone" dataKey="out" stroke="#8884d8" name="Stock OUT" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DailyChart;
