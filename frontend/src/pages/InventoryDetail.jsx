import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  Table,
  Card,
  Spin,
  message,
  Breadcrumb,
  Descriptions,
  Button,
  Tag,
} from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";

const InventoryDetails = () => {
  const [inventory, setInventory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch inventory + transactions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [inventoryRes, transactionRes] = await Promise.all([
          axios.get(`${backendUrl}/inventory/${id}`),
          axios.get(`${backendUrl}/transactions/inventory/${id}`)
        ]);

        const invData = inventoryRes?.data?.data ?? inventoryRes?.data ?? null;
        const trxList = transactionRes?.data?.data ?? transactionRes?.data ?? [];

        setInventory(invData);
        setTransactions(trxList);
      } catch (error) {
        console.error(error);
        message.error("Failed to load inventory details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const transactionColumns = [
    { title: "Transaction ID", dataIndex: "_id", key: "_id" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "IN" ? "green" : "volcano"}>{type}</Tag>
      ),
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    { title: "Remarks", dataIndex: "remarks", key: "remarks" },
  ];

  if (loading) {
    return <Spin size="large" style={{ margin: "auto", display: "block" }} />;
  }

  if (!inventory) {
    return <h1>Inventory not found.</h1>;
  }

  return (
    <div
      style={{
        width: "93vw",
        minHeight: "100vh",
        background: "#f7f9fc",
        padding: "2rem",
      }}
    >
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: "1rem" }}>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/view-products">Products</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Inventory Details</Breadcrumb.Item>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: "1rem" }}
      >
        Back
      </Button>

      {/* Inventory Details Card */}
      <Card
        title={`Inventory Details`}
        style={{
          marginBottom: "2rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Inventory ID">
            {inventory._id}
          </Descriptions.Item>
          <Descriptions.Item label="Product">
            {inventory.product?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Quantity">
            {inventory.quantity}
          </Descriptions.Item>
          <Descriptions.Item label="Unit">{inventory.product?.unit}</Descriptions.Item>
          <Descriptions.Item label="Location">
            {inventory.location}
          </Descriptions.Item>
          <Descriptions.Item label="Safety Stock Level">
            {inventory.safetyStockLevel}
          </Descriptions.Item>
          <Descriptions.Item label="Heat Number">
            {inventory.heatNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Batch Number">
            {inventory.batchNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Lot Number">
            {inventory.lotNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(inventory.createdAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Transactions Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "1rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "black" }}>
          🧾 Transactions for this Inventory
        </h2>
        {transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "gray" }}>
            No transactions recorded for this inventory.
          </p>
        ) : (
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        )}
      </div>
    </div>
  );
};

export default InventoryDetails;
