import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '../Layout.jsx'
import Dashboard from '../Pages/Dashboard'
import Inventory from '../Pages/Inventory'
import Weather from '../Pages/Weather'
import Analytics from '../Pages/Analytics'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout currentPageName="Dashboard">
            <Dashboard />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout currentPageName="Dashboard">
            <Dashboard />
          </Layout>
        } />
        <Route path="/inventory" element={
          <Layout currentPageName="Inventory">
            <Inventory />
          </Layout>
        } />
        <Route path="/weather" element={
          <Layout currentPageName="Weather">
            <Weather />
          </Layout>
        } />
        <Route path="/analytics" element={
          <Layout currentPageName="Analytics">
            <Analytics />
          </Layout>
        } />
      </Routes>
    </Router>
  </React.StrictMode>,
)