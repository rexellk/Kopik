import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Brain } from 'lucide-react';
import { InventoryItem, Recommendation } from "../src/services/entities.js";
import { ApiError } from "../src/services/api.js";

const StatCard = ({ title, value, change, trend, icon: Icon, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 ${className}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className={`flex items-center mt-2 text-sm ${
          trend === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'positive' ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span>{change}</span>
        </div>
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </motion.div>
);

export default function Analytics() {
  const [inventory, setInventory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [inventoryData, recsData] = await Promise.all([
          InventoryItem.list(),
          Recommendation.list()
        ]);
        
        setInventory(inventoryData);
        setRecommendations(recsData);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(err instanceof ApiError ? err.message : "Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics</h2>
          <p className="text-gray-600">Processing inventory data and insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Unavailable</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate analytics data
  const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0);
  const criticalItems = inventory.filter(item => {
    const daysLeft = item.current_stock / (item.daily_usage || 1);
    return daysLeft <= 2;
  }).length;
  
  const avgConfidence = recommendations.length > 0 
    ? Math.round(recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length)
    : 0;
    
  const highPriorityRecs = recommendations.filter(rec => rec.priority === 'high').length;

  // Mock data for charts
  const inventoryByCategory = [
    { name: 'Beverages', value: inventory.filter(i => i.category === 'Beverages').length },
    { name: 'Dairy', value: inventory.filter(i => i.category === 'Dairy').length },
    { name: 'Baking', value: inventory.filter(i => i.category === 'Baking Ingredients').length },
    { name: 'Frozen', value: inventory.filter(i => i.category === 'Frozen').length },
    { name: 'Other', value: inventory.filter(i => !['Beverages', 'Dairy', 'Baking Ingredients', 'Frozen'].includes(i.category)).length }
  ];

  const weeklyUsage = [
    { day: 'Mon', usage: 120, cost: 340 },
    { day: 'Tue', usage: 135, cost: 380 },
    { day: 'Wed', usage: 110, cost: 310 },
    { day: 'Thu', usage: 145, cost: 420 },
    { day: 'Fri', usage: 160, cost: 450 },
    { day: 'Sat', usage: 180, cost: 520 },
    { day: 'Sun', usage: 140, cost: 400 }
  ];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-6 bg-gray-50 min-h-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Data-driven insights for optimal inventory management
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Data updated</p>
          <p className="font-semibold text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Inventory Value"
          value={`$${totalValue.toFixed(0)}`}
          change="+8.2%"
          trend="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Items in Stock"
          value={inventory.length}
          change="+3 items"
          trend="positive"
          icon={Package}
        />
        <StatCard
          title="Critical Alerts"
          value={criticalItems}
          change="-2 items"
          trend="positive"
          icon={AlertTriangle}
        />
        <StatCard
          title="AI Confidence"
          value={`${avgConfidence}%`}
          change="+5%"
          trend="positive"
          icon={Brain}
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Weekly Usage Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Usage Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Inventory by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {inventoryByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {inventoryByCategory.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommendations Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations Impact</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{recommendations.length}</div>
            <div className="text-sm text-gray-600">Total Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{highPriorityRecs}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${Math.round(recommendations.reduce((sum, rec) => sum + (rec.profit_impact || 0), 0))}
            </div>
            <div className="text-sm text-gray-600">Potential Impact</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}