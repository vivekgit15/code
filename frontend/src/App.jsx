import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ViewProducts from "./pages/ViewProducts";
import ProductDetails from "./pages/ProductDetail";
import AddTransaction from "./pages/AddTransaction";
import ViewTransactions from "./pages/ViewTransactions";
import AddInventory from "./pages/AddInventory";
import InventoryDetails from "./pages/InventoryDetail";
import ViewInventory from "./pages/ViewInventory";
import ViewLogs from "./pages/ViewLogs";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, UserButton } from "@clerk/clerk-react";
import { Button } from "antd";
import AuthInitializer from "./AuthInitializer"
// import 'antd/dist/reset.css'

const App = () => {
  return (
    <BrowserRouter>
      {/* ✅ Only show nav when user is signed in */}
      <SignedIn>
        <AuthInitializer />
        <div
          style={{
            padding: "1rem",
            background: "#fff",
            borderBottom: "1px solid #eee",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link to="/"><Button>Dashboard</Button></Link>
            <Link to="/add-product"><Button>Add Product</Button></Link>
            <Link to="/view-products"><Button>View Products</Button></Link>
            <Link to="/add-inventory"><Button>Add Inventory</Button></Link>
            <Link to="/view-inventory"><Button>View Inventory</Button></Link>
            <Link to="/add-transaction"><Button>Add Transaction</Button></Link>
            <Link to="/view-transactions"><Button>View Transactions</Button></Link>
            <Link to="/view-logs"><Button>View Logs</Button></Link>
          </div>

          {/* 👤 Clerk user profile + logout */}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/view-products" element={<ViewProducts />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/add-inventory" element={<AddInventory />} />
          <Route path="/view-inventory" element={<ViewInventory />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/view-transactions" element={<ViewTransactions />} />
          <Route path="/inventory/:id" element={<InventoryDetails />} />
          <Route path="/view-logs" element={<ViewLogs />} />

        </Routes>
      </SignedIn>

      
      <SignedOut>
        <Routes>
          <Route path="/*" element={<RedirectToSignIn />} />
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        </Routes>
      </SignedOut>
    </BrowserRouter>
  );
};

export default App;
