import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Row,
  Col,
  Card,
} from 'antd';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react'; 

const { Option } = Select;

const AddTransaction = () => {
  const { user } = useUser(); 
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [selectedInventoryDetails, setSelectedInventoryDetails] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get(`${backendUrl}/inventory`);
        setInventory(res.data?.data || []);
      } catch (error) {
        console.error(error);
        message.error('Failed to fetch Inventory');
      }
    };
    fetchInventory();
  }, []);

  const handleInventorySelect = async (inventoryId) => {
    try {
      const res = await axios.get(`${backendUrl}/inventory/${inventoryId}`);
      setSelectedInventoryDetails(res.data);
    } catch (error) {
      console.error('Error fetching inventory details:', error);
      message.error('Failed to fetch inventory details');
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (values.type === 'OUT') {
        const balanceRes = await axios.get(`${backendUrl}/inventory/balance/${values.inventory}`);
        const currentBalance = balanceRes.data.balance;

        if (values.quantity > currentBalance) {
          message.error(`Insufficient quantity. Available: ${currentBalance}`);
          setLoading(false);
          return;
        }
      }

      const transactionData = {
        inventory: values.inventory,
        type: values.type,
        quantity: values.quantity,
        remarks: values.remarks || '',
        userEmail: user?.primaryEmailAddress?.emailAddress, 
      };

      await axios.post(`${backendUrl}/transactions`, transactionData);
      message.success(`Transaction (${values.type}) recorded successfully`);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to record transaction');
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
      <Row justify="center">
        <Col xs={24} md={18} lg={14}>
          <Card
            title="Record Stock Transaction (IN / OUT)"
            style={{
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderRadius: '10px',
            }}
          >
            <Form
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              style={{ marginTop: '1rem' }}
              form={form}
            >
              <Form.Item
                label="Select Inventory"
                name="inventory"
                rules={[{ required: true, message: 'Please select an inventory' }]}
              >
                <Select
                  placeholder="Select inventory"
                  onChange={handleInventorySelect}
                  showSearch
                  optionFilterProp="children"
                >
                  {inventory.map((inv) => (
                    <Option key={inv._id} value={inv._id}>
                      {inv.product?.name || 'Unnamed Product'} — {inv.product?.type || 'N/A'}
                      {' | '}
                      Lot: {inv.lotNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Transaction Type"
                    name="type"
                    rules={[{ required: true, message: 'Select transaction type' }]}
                  >
                    <Select placeholder="Select type">
                      <Option value="IN">IN (Stock Added)</Option>
                      <Option value="OUT">OUT (Stock Dispatched)</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Quantity"
                    name="quantity"
                    rules={[{ required: true, message: 'Enter quantity' }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="e.g. 100"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Remarks" name="remarks">
                    <Input placeholder="Optional (e.g. Supplier name, reason)" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Record Transaction
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddTransaction;
