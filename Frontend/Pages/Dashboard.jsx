import React, { useContext, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingDown, TrendingUp, RotateCcw } from "lucide-react";

// Keep: Weather impact simulator & Intelligence hub (existing components)
import WeatherPanel from "../components/dashboard/WeatherPanel";
import IntelligenceFeed from "../components/dashboard/IntelligenceFeed";
import AIRecommendations from "../components/dashboard/AIRecommendations";

import { DataContext } from "../src/context/DataContext";

// ---------- Stub data taken & adapted from Analytics ---------- //
const salesTrendData = [
  { date: "Jan 01", sales: 1250, predicted: 1300 },
  { date: "Jan 02", sales: 1180, predicted: 1200 },
  { date: "Jan 03", sales: 1320, predicted: 1310 },
  { date: "Jan 04", sales: 1450, predicted: 1400 },
  { date: "Jan 05", sales: 1510, predicted: 1500 },
  { date: "Jan 06", sales: 1480, predicted: 1490 },
  { date: "Jan 07", sales: 1550, predicted: 1550 },
];

const wasteBeforeAfter = [
  { month: "Oct", beforeKopik: 850, afterKopik: 320 },
  { month: "Nov", beforeKopik: 920, afterKopik: 290 },
  { month: "Dec", beforeKopik: 780, afterKopik: 245 },
  { month: "Jan", beforeKopik: 810, afterKopik: 210 },
];
// Convert to a single-series "Food Waste Reduction %"
const wasteReductionPct = wasteBeforeAfter.map(
  ({ month, beforeKopik, afterKopik }) => ({
    month,
    reductionPct: Math.round(((beforeKopik - afterKopik) / beforeKopik) * 100),
  })
);

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

const supplierData = [
  {
    name: "King Arthur",
    category: "Baking",
    rating: 4.8,
    onTimeDelivery: 98,
    qualityScore: 99,
  },
  {
    name: "Blue Bottle",
    category: "Beverages",
    rating: 4.9,
    onTimeDelivery: 99,
    qualityScore: 99,
  },
  {
    name: "Local Dairy Co",
    category: "Dairy",
    rating: 4.5,
    onTimeDelivery: 95,
    qualityScore: 97,
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

// ---------- UI bits ---------- //
const MetricCard = ({ title, value, change, timeframe, icon: Icon, color }) => (
  <Card className="shadow-sm border rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change && timeframe && (
        <p className="text-xs text-gray-500 mt-2">
          {change} {timeframe}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function UnifiedDashboard() {
  const { data, loading, error } = useContext(DataContext);
  const [selectedWeather, setSelectedWeather] = useState("cloudy");

  // Weather impact descriptors used below the simulator
  const weatherImpact = {
    sunny: {
      label: "Sunny",
      bg: "bg-yellow-50",
      text: "Expect +80% cold drinks, +20% footfall. Prepare ice, cold brew, smoothies.",
    },
    rainy: {
      label: "Rainy",
      bg: "bg-blue-50",
      text: "Expect +25% hot drinks, +15% pastries. Emphasize soups and baked goods.",
    },
    cloudy: {
      label: "Cloudy",
      bg: "bg-gray-50",
      text: "Expect +10% hot drinks. Steady footfall; focus on comfort items.",
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data.</div>;
  }

  const criticalItems = data.alerts.filter(
    (i) => i.priority === "high"
  ).length;

  // Static business KPIs (can be wired to backend later)
  const totalRevenue = "$45,720";
  const foodWasteReduction = "32%"; // overall headline
  const inventoryTurnover = "8.4x";
  const profitMargin = "28.7%";

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Ondo Bakery</h1>
      </motion.div>

      {/* Critical + Revenue + Waste Reduction + Inventory Turnover + Profit Margin */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <MetricCard
          title="Critical Items"
          value={criticalItems}
          icon={TrendingDown}
          color="text-red-500"
        />
        <MetricCard
          title="Total Revenue"
          value={totalRevenue}
          icon={DollarSign}
          color="text-emerald-500"
          change="+12.5%"
          timeframe="This Month"
        />
        <MetricCard
          title="Food Waste Reduction"
          value={foodWasteReduction}
          icon={TrendingDown}
          color="text-blue-500"
          change="+8.2%"
          timeframe="vs Last Month"
        />
        <MetricCard
          title="Inventory Turnover"
          value={inventoryTurnover}
          icon={RotateCcw}
          color="text-purple-500"
          change="+1.2x"
          timeframe="Quarterly"
        />
        <MetricCard
          title="Profit Margin"
          value={profitMargin}
          icon={TrendingUp}
          color="text-emerald-600"
          change="+3.1%"
          timeframe="YTD"
        />
      </motion.div>

      {/* Side-by-side: Daily Sales Trend & Food Waste Reduction (single-series) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Daily Sales Trend</h3>
            <select className="border rounded-lg px-3 py-1 text-sm bg-white">
              <option>Last 7 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v, n) => [
                  `$${v}`,
                  n === "sales" ? "Actual" : "Predicted",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#10B981"
                strokeDasharray="5 5"
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">
            Food Waste Reduction (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteReductionPct}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, "Reduction"]} />
              <Legend />
              <Bar
                dataKey="reductionPct"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="Reduction %"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AIRecommendations
          recommendations={data.recommendations}
          onApplyRecommendation={(rec) =>
            console.log("Apply recommendation:", rec?.title)
          }
        />
      </motion.div>

      {/* Top Performing Items */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border rounded-2xl p-6">
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
              {topItemsData.map((item, idx) => (
                <TableRow key={idx} className="border-b hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {item.unitsSold}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    ${item.revenue}
                  </TableCell>
                  <TableCell>{item.margin}%</TableCell>
                  <TableCell>
                    <span
                      className={`${
                        item.trend > 0 ? "text-emerald-600" : "text-red-500"
                      } font-semibold`}
                    >
                      {item.trend > 0 ? "+" : ""}
                      {item.trend}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Profit Analysis — now full width for more space */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Profit Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div>
              <h4 className="text-sm font-medium mb-2 text-center">
                Revenue Breakdown
              </h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Cost Structure</h4>
              <div className="space-y-3 pt-2">
                {costStructure.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600">{c.category}</span>
                      <span className="font-semibold">${c.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600"
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

      {/* Weather Impact Simulator — full width with dynamic background and extra spacing */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`border rounded-2xl p-4`}>
          <h3 className="text-lg font-semibold mb-2">
            Weather Impact Simulator
          </h3>
          <div className="p-2">
            <WeatherPanel
              selectedWeather={selectedWeather}
              onWeatherChange={setSelectedWeather}
            />
          </div>
          <div className="mt-4 rounded-xl border bg-white/60 p-4">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Expected impact: </span>
              {weatherImpact[selectedWeather]?.text}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Supplier Performance (40%) + Intelligence Hub (60%) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-10 gap-6"
      >
        <Card className="border rounded-2xl p-6 lg:col-span-4">
          <h3 className="text-lg font-semibold mb-4">Supplier Performance</h3>
          <div className="space-y-3">
            {supplierData.map((s, i) => (
              <div key={i} className="border rounded-xl p-3 bg-gray-50">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-semibold">{s.name}</h4>
                    <p className="text-xs text-gray-500">{s.category}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    {s.rating}/5.0
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="flex justify-between">
                    <span>On-time:</span>
                    <span className="font-semibold">{s.onTimeDelivery}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <span className="font-semibold">{s.qualityScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border rounded-2xl p-4 lg:col-span-6">
          <h3 className="text-lg font-semibold mb-2">
            Intelligence Hub (Events & Concerts)
          </h3>
          <div className="p-2">
            <IntelligenceFeed intelligenceSignals={data.intelligenceSignals || data.alerts} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
