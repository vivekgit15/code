import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, message, Row, Col } from "antd";
import axios from "axios";

const { Option } = Select;

const AddInventory = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch products on mount (to link inventory)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/products");
        setProducts(res.data.data);
        // console.log("Products API response:", res.data);

      } catch (err) {
        console.error("Error fetching products:", err);
        message.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  // ✅ Submit form data
  const onFinish = async (values) => {
    const cleanData = {
      ...values,
      product: values.product, // product ID
      location: values.location || "",
      heatNumber: values.heatNumber || "",
      batchNumber: values.batchNumber || "",
      lotNumber: values.lotNumber || "",
      safetyStockLevel: values.safetyStockLevel || 0,
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:8000/api/inventory", cleanData, {
        headers: { "Content-Type": "application/json" },
      });

      message.success("✅ Inventory added successfully!");
      form.resetFields();
    } catch (error) {
      console.error("❌ Error adding inventory:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Failed to add inventory");
    } finally {
      setLoading(false);
    }
  };

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
        📦 Add New Inventory Lot
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
        }}
      >
        <Row gutter={[24, 16]}>
          {/* Select Product */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              label="Select Product"
              name="product"
              rules={[{ required: true, message: "Please select a product" }]}
            >
              <Select placeholder="Choose a product"
              showSearch
              optionFilterProp="children"
              >
                {products.map((prod) => (
                  <Option key={prod._id} value={prod._id}>
                    {prod.name} ({prod.materialGrade})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Quantity */}
          {/* <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[{ required: true, message: "Enter quantity" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 100" />
            </Form.Item>
          </Col> */}

          {/* Unit
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Unit" name="unit" initialValue="KG">
              <Select>
                <Option value="KG">KG</Option>
                <Option value="TON">TON</Option>
                <Option value="PIECE">PIECE</Option>
                <Option value="METER">METER</Option>
              </Select>
            </Form.Item>
          </Col> */}

          {/* Location */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Location" name="location">
              <Input placeholder="e.g. Warehouse A - Rack 5" />
            </Form.Item>
          </Col>

          {/* Safety Stock */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Safety Stock Level" name="safetyStockLevel">
              <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 20" />
            </Form.Item>
          </Col>

          {/* Lot, Heat, Batch Numbers */}
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Lot Number" name="lotNumber">
              <Input placeholder="e.g. L123" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Heat Number" name="heatNumber">
              <Input placeholder="e.g. H567" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Form.Item label="Batch Number" name="batchNumber">
              <Input placeholder="e.g. B789" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              width: "250px",
              height: "45px",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Add Inventory
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddInventory;
