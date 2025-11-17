const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { requireAuth } = require('@clerk/clerk-sdk-node');
const productRoutes = require('./routes/product.routes');
const transactionRoutes = require('./routes/transaction.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const logRoutes = require('./routes/log.routes');






dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Protected Route Example (using Clerk middleware)
// app.get('/api/protected',  async (req, res) => {
//   const userId = req.auth.userId;
//   const user = await clerkClient.users.getUser(userId);
//   res.json({ message: `Hello ${user.firstName}, you are authenticated!` });
// });

// All product routes (protected by Clerk)



  app.use('/api/products',  productRoutes);
app.use('/api/transactions',   transactionRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/logs' ,  logRoutes);




const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
