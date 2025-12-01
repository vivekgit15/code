import React, { useEffect, useState } from "react";
import { Table, Tag, Card, message, Button } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/logs`);
      setLogs(res.data?.data || []);
    } catch (error) {
      message.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Columns
  const columns = [
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
      render: (text) => text || <Tag color="red">Unknown</Tag>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => (
        <Tag
          color={
            action?.toLowerCase().includes("delete")
              ? "red"
              : action?.toLowerCase().includes("update")
              ? "orange"
              : action?.toLowerCase().includes("error")
              ? "red"
              : "green"
          }
        >
          {action}
        </Tag>
      ),
    },
    {
      title: "Entity Type",
      dataIndex: "entityType",
      key: "entityType",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Entity ID",
      dataIndex: "entityId",
      key: "entityId",
      render: (id) => id || "-",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (details) => (
        <div className="log-details">
          {typeof details === "object"
            ? Object.entries(details)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" | ")
            : details}
        </div>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD MMM YYYY, hh:mm A"),
    },
  ];

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f7f9fc",
        padding: "2rem",
      }}
    >
      <Card
        title="Activity Logs"
        extra={
          <Button type="primary" onClick={handlePrint}>
            🖨 Print Logs
          </Button>
        }
        style={{
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: "10px",
        }}
      >
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="logs-table"
          scroll = {{x:true}}
        />
      </Card>

      
      <style>
        {`
          /* General table layout */
          .logs-table .log-details {
            max-height: 100px;
            overflow-y: auto;
            white-space: pre-wrap;
            background: #eef1f6;
            padding: 6px;
            border-radius: 6px;
            font-size: 13px;
          }

          /* --- PRINT MODE --- */
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background: white;
            }

            /* Show full log details when printing */
            .logs-table .log-details {
              max-height: none !important;
              overflow: visible !important;
              background: white !important;
              border: 1px solid #ccc;
              page-break-inside: avoid;
              font-size: 11px;
            }

            /* Each log fits neatly per page if needed */
            .ant-table-row {
              page-break-inside: avoid;
            }

            /* Hide buttons, pagination, etc. */
            .ant-card-extra,
            .ant-pagination {
              display: none !important;
            }

            /* Adjust spacing */
            .ant-table {
              font-size: 11px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ViewLogs;
