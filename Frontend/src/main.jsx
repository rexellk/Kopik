import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../Layout.jsx";
import Dashboard from "../Pages/Dashboard";
import Inventory from "../Pages/Inventory";
import Order from "../Pages/Order";
import Weather from "../Pages/Weather";
import "./index.css";
import { DataProvider } from "./context/DataContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DataProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout currentPageName="Dashboard">
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Layout currentPageName="Dashboard">
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/inventory"
            element={
              <Layout currentPageName="Inventory">
                <Inventory />
              </Layout>
            }
          />
          <Route
            path="/order"
            element={
              <Layout currentPageName="Order">
                <Order />
              </Layout>
            }
          />
          <Route
            path="/weather"
            element={
              <Layout currentPageName="Weather">
                <Weather />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </DataProvider>
  </React.StrictMode>
);
