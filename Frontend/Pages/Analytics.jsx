import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  TrendingDown,
  RotateCcw,
  TrendingUp,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const salesTrendData = [
  { date: "Jan 01", sales: 1250, predicted: 1300 },
  { date: "Jan 02", sales: 1180, predicted: 1200 },
  { date: "Jan 03", sales: 1320, predicted: 1310 },
  { date: "Jan 04", sales: 1450, predicted: 1400 },
  { date: "Jan 05", sales: 1510, predicted: 1500 },
  { date: "Jan 06", sales: 1480, predicted: 1490 },
  { date: "Jan 07", sales: 1550, predicted: 1550 },
];
const topItemsData = [
  {
    name: "Cappuccino",
    category: "Beverages",
    unitsSold: 245,
    revenue: 1225,
    margin: 68,
    trend: 12,
  },
  {
    name: "Croissant",
    category: "Pastries",
    unitsSold: 189,
    revenue: 756,
    margin: 45,
    trend: 8,
  },
  {
    name: "Cold Brew",
    category: "Beverages",
    unitsSold: 152,
    revenue: 912,
    margin: 72,
    trend: 25,
  },
  {
    name: "Avocado Toast",
    category: "Food",
    unitsSold: 112,
    revenue: 1232,
    margin: 55,
    trend: -5,
  },
];
const wasteData = [
  { month: "Oct", beforeKopik: 850, afterKopik: 320 },
  { month: "Nov", beforeKopik: 920, afterKopik: 290 },
  { month: "Dec", beforeKopik: 780, afterKopik: 245 },
  { month: "Jan", beforeKopik: 810, afterKopik: 210 },
];
const supplierData = [
  {
    name: "King Arthur",
    category: "Baking",
    rating: 4.8,
    onTimeDelivery: 98,
    qualityScore: 99,
    costEfficiency: "Good",
  },
  {
    name: "Blue Bottle",
    category: "Beverages",
    rating: 4.9,
    onTimeDelivery: 99,
    qualityScore: 99,
    costEfficiency: "Premium",
  },
  {
    name: "Local Dairy Co",
    category: "Dairy",
    rating: 4.5,
    onTimeDelivery: 95,
    qualityScore: 97,
    costEfficiency: "Excellent",
  },
];
const revenueBreakdown = [
  { name: "Beverages", value: 400 },
  { name: "Pastries", value: 300 },
  { name: "Food", value: 200 },
  { name: "Merch", value: 100 },
];
const costStructure = [
  { category: "Ingredients", amount: 8000, percentage: 45 },
  { category: "Labor", amount: 6000, percentage: 35 },
  { category: "Rent", amount: 3000, percentage: 15 },
  { category: "Other", amount: 1000, percentage: 5 },
];
const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const MetricCard = ({ title, value, change, timeframe, icon: Icon, color }) => (
  <Card className="shadow-elegant border-0">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-${color}-500`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-gray-500">
        {change} {timeframe}
      </p>
    </CardContent>
  </Card>
);

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="p-6 bg-gray-50 min-h-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Deep dive into your business performance
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Total Revenue"
          value="$45,720"
          change="+12.5%"
          timeframe="This Month"
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Food Waste Reduction"
          value="32%"
          change="+8.2%"
          timeframe="vs Last Month"
          icon={TrendingDown}
          color="blue"
        />
        <MetricCard
          title="Inventory Turnover"
          value="8.4x"
          change="+1.2x"
          timeframe="Quarterly"
          icon={RotateCcw}
          color="purple"
        />
        <MetricCard
          title="Profit Margin"
          value="28.7%"
          change="+3.1%"
          timeframe="YTD"
          icon={TrendingUp}
          color="green"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="shadow-elegant border-0 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Daily Sales Trend</h3>
            <select className="border rounded-lg px-3 py-1 text-sm bg-white">
              <option>Last 30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                formatter={(value, name) => [
                  `$${value}`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Actual Sales"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#10B981"
                strokeDasharray="5 5"
                name="AI Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="shadow-elegant border-0 p-6">
          <h3 className="text-lg font-semibold mb-4">Food Waste Reduction</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip formatter={(value, name) => [`$${value}`, name]} />
              <Legend />
              <Bar
                dataKey="beforeKopik"
                fill="#EF4444"
                name="Before Kopik"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="afterKopik"
                fill="#10B981"
                name="After Kopik"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
      >
        <Card className="shadow-elegant border-0 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topItemsData.map((item, index) => (
                <TableRow key={index} className="border-b hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {item.unitsSold}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${item.revenue}
                  </TableCell>
                  <TableCell>{item.margin}%</TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center font-semibold ${
                        item.trend > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.trend > 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {item.trend}%
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="shadow-elegant border-0 p-6">
          <h3 className="text-lg font-semibold mb-4">Supplier Performance</h3>
          <div className="space-y-4">
            {supplierData.map((s, i) => (
              <div key={i} className="border rounded-lg p-4 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{s.name}</h4>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                    {s.rating}/5.0
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>On-time Delivery:</span>
                    <span className="font-semibold">{s.onTimeDelivery}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Score:</span>
                    <span className="font-semibold">{s.qualityScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="shadow-elegant border-0 p-6">
          <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-center">
                Revenue Breakdown
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={5}
                    label={({ name, percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {revenueBreakdown.map((e, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="font-medium mb-3">Cost Structure</h4>
              <div className="space-y-4 pt-4">
                {costStructure.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600 text-sm">
                        {c.category}
                      </span>
                      <span className="font-semibold text-sm">${c.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
