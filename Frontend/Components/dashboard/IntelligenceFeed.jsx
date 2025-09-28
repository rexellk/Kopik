import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calculator, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const profitData = {
  daily: {
    without: 850,
    with: 1190,
    improvement: 340,
    chart: [
      { name: "Mon", without: 820, with: 1150 },
      { name: "Tue", without: 880, with: 1220 },
      { name: "Wed", without: 850, with: 1190 },
      { name: "Thu", without: 830, with: 1170 },
      { name: "Fri", without: 920, with: 1280 },
      { name: "Sat", without: 980, with: 1350 },
      { name: "Sun", without: 870, with: 1200 },
    ],
  },
  weekly: {
    without: 5950,
    with: 8330,
    improvement: 2380,
    chart: [
      { name: "Week 1", without: 5800, with: 8100 },
      { name: "Week 2", without: 6100, with: 8500 },
      { name: "Week 3", without: 5950, with: 8330 },
      { name: "Week 4", without: 6200, with: 8600 },
    ],
  },
  monthly: {
    without: 25500,
    with: 35700,
    improvement: 10200,
    chart: [
      { name: "Jan", without: 24000, with: 34000 },
      { name: "Feb", without: 26000, with: 36000 },
      { name: "Mar", without: 25500, with: 35700 },
      { name: "Apr", without: 27000, with: 37500 },
    ],
  },
};

export default function ProfitCalculator() {
  const [activeTab, setActiveTab] = useState("daily");
  const currentData = profitData[activeTab];

  return (
    <Card className="shadow-elegant border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Profit Impact Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="daily" className="font-medium">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="font-medium">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="font-medium">
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Profit Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Current{" "}
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                    Profit
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  ${currentData.without.toLocaleString()}
                </div>
                <p className="text-xs text-red-600 mt-1">Without Kopik AI</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    With Kopik AI
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ${currentData.with.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  AI-optimized profit
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                    Improvement
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  +${currentData.improvement.toLocaleString()}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  +
                  {Math.round(
                    (currentData.improvement / currentData.without) * 100
                  )}
                  % increase
                </p>
              </motion.div>
            </div>

            {/* Profit Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 mb-4">
                Profit Comparison Chart
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData.chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `$${value}`,
                        name === "without" ? "Without Kopik" : "With Kopik",
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar
                      dataKey="without"
                      fill="#EF4444"
                      name="without"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="with"
                      fill="#10B981"
                      name="with"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* ROI Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200"
            >
              <h3 className="font-bold text-indigo-900 mb-4">ROI Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-3">
                    Cost Savings
                  </h4>
                  <ul className="space-y-2 text-sm text-indigo-700">
                    <li>
                      • Waste Reduction: $
                      {Math.round(
                        currentData.improvement * 0.4
                      ).toLocaleString()}
                    </li>
                    <li>
                      • Optimized Ordering: $
                      {Math.round(
                        currentData.improvement * 0.3
                      ).toLocaleString()}
                    </li>
                    <li>
                      • Labor Efficiency: $
                      {Math.round(
                        currentData.improvement * 0.2
                      ).toLocaleString()}
                    </li>
                    <li>
                      • Energy Savings: $
                      {Math.round(
                        currentData.improvement * 0.1
                      ).toLocaleString()}
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-3">
                    Revenue Increases
                  </h4>
                  <ul className="space-y-2 text-sm text-indigo-700">
                    <li>
                      • Demand Prediction: +
                      {Math.round(
                        (currentData.improvement / currentData.without) * 40
                      )}
                      %
                    </li>
                    <li>
                      • Weather Optimization: +
                      {Math.round(
                        (currentData.improvement / currentData.without) * 30
                      )}
                      %
                    </li>
                    <li>
                      • Stock Availability: +
                      {Math.round(
                        (currentData.improvement / currentData.without) * 20
                      )}
                      %
                    </li>
                    <li>
                      • Customer Satisfaction: +
                      {Math.round(
                        (currentData.improvement / currentData.without) * 10
                      )}
                      %
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
