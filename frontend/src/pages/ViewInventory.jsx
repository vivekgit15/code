import React, { useEffect, useState } from "react";
import { Table, message, Tag, Button, Modal, Form, InputNumber, Input, Select, Popconfirm } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const ViewInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all inventory on mount
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/inventory`);
      

      // Normalize the response similar to ProductDetail.jsx
      const payload = res.data;
      let list = [];
      
      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload?.data)) {
        list = payload.data;
      } else if (Array.isArray(payload?.items)) {
        list = payload.items;
      } else if (Array.isArray(payload?.inventory)) {
        list = payload.inventory;
      }

      
      setInventory(list);

    } catch (error) {
      message.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Delete inventory
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/inventory/${id}`);
      message.success("Inventory deleted successfully!");
      fetchInventory(); // refresh table
    } catch (error) {
      message.error("Failed to delete inventory");
    }
  };

  // Open modal for editing
  const handleEdit = (record) => {
    setSelectedInventory(record);
    // set only the fields the form expects (avoid nested product object being passed directly)
    form.setFieldsValue({
      quantity: record.quantity,
      unit: record.unit,
      location: record.location,
    });
    setIsModalOpen(true);
  };

  // Submit edit form
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(`${backendUrl}/inventory/${selectedInventory._id}`, values);
      message.success("Inventory updated successfully!");
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      message.error("Failed to update inventory");
    }
  };

  // Table columns
  const columns = [
    {
      title: "Product Name",
      dataIndex: ["product", "name"],
      key: "productName",
      render: (text,record) =>(
        <Button
                  type="link"
                  onClick={() => navigate(`/inventory/${record._id}`)} // Navigate to detail page
                >
                  {text}
                </Button>
      )
      ,
    },
    {
      title: "Material Grade",
      dataIndex: ["product", "materialGrade"],
      key: "materialGrade",
    },
    {
      title: "Type",
      dataIndex: ["product", "type"],
      key: "type",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => <b>{qty}</b>,
    },
    {
      title: "Unit",
      dataIndex: ["product" , "unit"],
      key: "unit",
      render: (unit) => <Tag color="blue">{unit}</Tag>,
    },
    {
      title: "Lot No",
      dataIndex: "lotNumber",
      key: "lotNumber",
      render: (lot) => lot || "-",
    },
    {
      title: "Heat No",
      dataIndex: "heatNumber",
      key: "heatNumber",
      render: (heat) => heat || "-",
    },
    {
      title: "Batch No",
      dataIndex: "batchNumber",
      key: "batchNumber",
      render: (batch) => batch || "-",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (loc) => loc || "-",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this inventory?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        width: "93vw",
        minHeight: "100vh",
        background: "#f7f9fc",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "2rem",
          fontWeight: "bold",
          color: "black",
        }}
      >
      Inventory Overview
      </h1>

      <Table
        dataSource={Array.isArray(inventory) ? inventory : []} // guard just in case
        columns={columns}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />

      
      <Modal
        title="Update Inventory"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText="Update"
      >
        <Form layout="vertical" form={form}>
         

          <Form.Item label="Location" name="location">
            <Input placeholder="e.g. Warehouse A - Rack 5" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewInventory;
