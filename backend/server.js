const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const productRoutes = require('./routes/product.routes');
const transactionRoutes = require('./routes/transaction.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const logRoutes = require('./routes/log.routes');

dotenv.config();

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-user-id",
    "x-user-email"
  ],
}));

app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('DB Error:', err));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
