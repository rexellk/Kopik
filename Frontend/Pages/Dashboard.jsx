import React, { useState, useEffect, useCallback } from "react";
import {
  InventoryItem,
  Recommendation,
  IntelligenceSignal,
} from "../Entities/all.js";
import { motion } from "framer-motion";
import { Package, AlertTriangle, DollarSign, Brain } from "lucide-react";

import StatusCard from "../Components/dashboard/StatusCard";
import InventoryGrid from "../Components/dashboard/InventoryGrid";
import WeatherPanel from "../Components/dashboard/WeatherPanel";
import AIRecommendations from "../Components/dashboard/AIRecommendations";
import ProfitCalculator from "../Components/dashboard/ProfitCalculator";
import IntelligenceFeed from "../Components/dashboard/IntelligenceFeed";

export default function Dashboard() {
  const [inventoryData, setInventoryData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [intelligenceSignals, setIntelligenceSignals] = useState([]);
  const [selectedWeather, setSelectedWeather] = useState("cloudy");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [inventory, recs, signals] = await Promise.all([
        InventoryItem.list(),
        Recommendation.list(),
        IntelligenceSignal.list(),
      ]);

      const updatedInventory = inventory.map((item) => {
        const daily_usage = item.daily_usage || 1; // Prevent division by zero
        const daysLeft = item.currentStock / daily_usage;
        let status = "good";
        if (daysLeft <= 2) status = "critical";
        else if (daysLeft <= 5) status = "low";

        return { ...item, daysLeft, status };
      });

      setInventoryData(updatedInventory);
      setRecommendations(recs);
      setIntelligenceSignals(signals);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdvancedRecommendations = useCallback(() => {
    // This is a simplified simulation for demo purposes.
    // A real implementation would involve a more complex AI model.
    let newRecs = [];

    // Example 1: Perfect Storm - Concert + Sunny + Payday
    if (
      intelligenceSignals.some((s) => s.name === "Taylor Swift Concert") &&
      selectedWeather === "sunny" &&
      intelligenceSignals.some((s) => s.name === "Payday Cycle")
    ) {
      newRecs.push({
        priority: "high",
        title: '"Perfect Storm": Concert + Sunny + Payday',
        description:
          "Anticipate 400% demand for premium cold drinks and desserts. Extend hours, triple stock of cold brew & premium cookies.",
        profit_impact: 2400,
        confidence: 94,
        action_required: true,
        category: "demand",
        trigger_sources: [
          "Taylor Swift Concert",
          "Payday Cycle",
          "Sunny Weather",
        ],
      });
    }

    // Example 2: Rainy day special with low flour stock
    if (
      selectedWeather === "rainy" &&
      inventoryData.some(
        (i) => i.name.toLowerCase().includes("flour") && i.status === "low"
      )
    ) {
      newRecs.push({
        priority: "medium",
        title: "Rainy Day Pastry Push",
        description:
          'Rain increases pastry demand. With flour stocks low, consider a "2-for-1" on existing pastries to sell through before reordering.',
        profit_impact: 80,
        confidence: 85,
        action_required: true,
        category: "promotion",
        trigger_sources: ["Rainy Weather", "Low Flour Stock"],
      });
    }

    // Example 3: Cold weather for hot beverages
    if (selectedWeather === "cloudy" || selectedWeather === "rainy") {
      // Assuming 'cloudy' can imply colder or damp weather
      newRecs.push({
        priority: "low",
        title: "Increase Hot Beverage Prep",
        description:
          "Colder weather typically increases hot coffee sales. Consider preparing 20% more hot beverages.",
        profit_impact: 120,
        confidence: 88,
        action_required: true,
        category: "weather",
        trigger_sources: ["Cloudy Weather"],
      });
    }

    // Example 4: Sunny weather for cold drinks
    if (selectedWeather === "sunny") {
      newRecs.push({
        priority: "low",
        title: "Boost Cold Drink Stock",
        description:
          "Sunny weather increases cold drink demand by 80%. Ensure adequate ice and cold beverage inventory.",
        profit_impact: 150,
        confidence: 92,
        action_required: true,
        category: "weather",
        trigger_sources: ["Sunny Weather"],
      });
    }

    // Filter out previous dynamic recommendations (weather, demand, promotion)
    // and combine with new dynamic ones
    setRecommendations((prev) => [
      ...newRecs,
      ...prev.filter(
        (r) =>
          r.category !== "demand" &&
          r.category !== "weather" &&
          r.category !== "promotion"
      ),
    ]);
  }, [selectedWeather, intelligenceSignals, inventoryData]);

  useEffect(() => {
    loadData();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (!isLoading) {
      generateAdvancedRecommendations();
    }
  }, [selectedWeather, isLoading, generateAdvancedRecommendations]); // Depends on selectedWeather, isLoading, and memoized generateAdvancedRecommendations

  const handleReorder = (item) => {
    // In a real app, this would trigger a reorder process
    console.log("Reordering:", item.name);
  };

  const handleApplyRecommendation = (rec) => {
    console.log("Applying recommendation:", rec.title);
  };

  const criticalItems = inventoryData.filter(
    (item) => item.status === "critical"
  ).length;
  const dailyWaste = 125; // Mock value
  const predictedProfit = 1450; // Increased profit with new intelligence
  const aiConfidence = 97; // Increased confidence

  return (
    <div className="p-6 bg-gray-50 min-h-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            AI-powered inventory insights for Demo Cafe
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="font-semibold text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatusCard
          title="Critical Items"
          value={criticalItems}
          subtitle="Need immediate attention"
          icon={AlertTriangle}
          trend="negative"
          trendValue="+2"
          colorClass="bg-red-500"
          bgGradient="bg-gradient-to-r from-red-500 to-red-600"
        />
        <StatusCard
          title="Daily Waste"
          value={`$${dailyWaste}`}
          subtitle="35% reduction this month"
          icon={Package}
          trend="positive"
          trendValue="-$60"
          colorClass="bg-green-500"
          bgGradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatusCard
          title="Predicted Profit"
          value={`$${predictedProfit.toLocaleString()}`}
          subtitle="55% increase with AI"
          icon={DollarSign}
          trend="positive"
          trendValue="+$600"
          colorClass="bg-blue-500"
          bgGradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatusCard
          title="AI Confidence"
          value={`${aiConfidence}%`}
          subtitle="Multi-source intelligence"
          icon={Brain}
          trend="positive"
          trendValue="+3%"
          colorClass="bg-purple-500"
          bgGradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Inventory */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <InventoryGrid
            inventoryData={inventoryData}
            onReorder={handleReorder}
          />
        </motion.div>

        {/* Right Column - Weather & Intelligence */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <WeatherPanel
            selectedWeather={selectedWeather}
            onWeatherChange={setSelectedWeather}
          />
          <IntelligenceFeed intelligenceSignals={intelligenceSignals} />
        </motion.div>
      </div>

      {/* Middle Section - AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AIRecommendations
          recommendations={recommendations}
          onApplyRecommendation={handleApplyRecommendation}
        />
      </motion.div>

      {/* Bottom Section - Profit Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ProfitCalculator />
      </motion.div>
    </div>
  );
}
