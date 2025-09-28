import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sun,
  CloudRain,
  Cloud,
  Flame,
  Snowflake,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Wind,
  Droplets,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

const weatherScenarios = [
  {
    id: "sunny",
    name: "Sunny & Warm",
    icon: "☀️",
    temp: 75,
    description: "Clear skies, perfect weather",
    impacts: {
      coldDrinks: +80,
      hotDrinks: -30,
      iceCream: +120,
      pastries: +15,
      outdoorSeating: +90,
    },
  },
  {
    id: "rainy",
    name: "Rainy & Cold",
    icon: "🌧️",
    temp: 45,
    description: "Heavy rain expected",
    impacts: {
      hotDrinks: +40,
      coldDrinks: -60,
      pastries: +25,
      soup: +80,
      comfortFood: +50,
    },
  },
  {
    id: "hot",
    name: "Heat Wave",
    icon: "🔥",
    temp: 95,
    description: "Extremely hot day",
    impacts: {
      coldDrinks: +150,
      hotDrinks: -70,
      iceCream: +200,
      frozenTreats: +180,
      heavyFood: -40,
    },
  },
  {
    id: "snow",
    name: "Snow Storm",
    icon: "❄️",
    temp: 28,
    description: "Heavy snow, stay indoors",
    impacts: {
      hotDrinks: +90,
      coldDrinks: -80,
      comfortFood: +120,
      deliveries: +60,
      footTraffic: -50,
    },
  },
];

const forecastData = [
  {
    date: "Today",
    icon: "☀️",
    description: "Sunny",
    temp: 72,
    salesChange: +18,
  },
  {
    date: "Tomorrow",
    icon: "☁️",
    description: "Cloudy",
    temp: 68,
    salesChange: +5,
  },
  {
    date: "Fri, Jan 14",
    icon: "🌧️",
    description: "Light Rain",
    temp: 62,
    salesChange: -12,
  },
];

const CurrentWeatherCard = () => (
  <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white mb-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Today's Weather</h2>
        <p className="opacity-90">Los Angeles, CA</p>
      </div>
      <div className="text-right">
        <div className="text-4xl font-bold">72°F</div>
        <div className="flex items-center justify-end">
          <Sun className="w-8 h-8 mr-2" />
          <span>Sunny</span>
        </div>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
      <div className="flex items-center gap-2">
        <Droplets className="w-4 h-4" />
        Humidity: 45%
      </div>
      <div className="flex items-center gap-2">
        <Wind className="w-4 h-4" />
        Wind: 8 mph
      </div>
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        UV Index: 7
      </div>
    </div>
  </div>
);

const WeatherImpactChart = ({ selectedWeather }) => {
  const weather = weatherScenarios.find((w) => w.id === selectedWeather);
  if (!weather) return null;

  const impactData = Object.entries(weather.impacts).map(
    ([category, change]) => ({
      category,
      change,
      baseline: 100, // Assuming a baseline
      predicted: 100 + change,
    })
  );

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-lg">Predicted Demand Changes</h4>
      {impactData.map((item) => (
        <motion.div
          key={item.category}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{item.category}</span>
            <span
              className={`font-bold ${
                item.change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.change > 0 ? "+" : ""}
              {item.change}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full ${
                item.change > 0 ? "bg-green-500" : "bg-red-500"
              }`}
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, Math.abs(item.change))}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="text-sm text-gray-600">vs. Baseline</div>
        </motion.div>
      ))}
    </div>
  );
};

const WeatherSimulator = ({ selectedWeather, setSelectedWeather }) => {
  return (
    <Card className="bg-white rounded-xl shadow-elegant p-6 border-0">
      <h3 className="text-xl font-bold mb-4">Weather Impact Simulator</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {weatherScenarios.map((weather) => (
          <motion.button
            key={weather.id}
            onClick={() => setSelectedWeather(weather.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              selectedWeather === weather.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">{weather.icon}</div>
            <div className="font-semibold">{weather.name}</div>
            <div className="text-sm text-gray-600">{weather.temp}°F</div>
          </motion.button>
        ))}
      </div>
      <WeatherImpactChart selectedWeather={selectedWeather} />
    </Card>
  );
};

const ThreeDayForecast = () => (
  <Card className="bg-white rounded-xl shadow-elegant p-6 border-0">
    <h3 className="text-xl font-bold mb-4">3-Day Business Forecast</h3>
    <div className="space-y-4">
      {forecastData.map((day, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">{day.icon}</div>
            <div>
              <div className="font-semibold">{day.date}</div>
              <div className="text-sm text-gray-600">{day.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{day.temp}°F</div>
            <div
              className={`text-sm font-semibold ${
                day.salesChange > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Sales: {day.salesChange > 0 ? "+" : ""}
              {day.salesChange}%
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </Card>
);

export default function WeatherPage() {
  const [selectedWeather, setSelectedWeather] = useState("sunny");

  return (
    <div className="p-6 bg-gray-50 min-h-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Weather Impact</h1>
        <p className="text-gray-500 mt-1">
          Simulate and predict weather's effect on your business
        </p>
      </motion.div>
      <CurrentWeatherCard />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeatherSimulator
            selectedWeather={selectedWeather}
            setSelectedWeather={setSelectedWeather}
          />
        </div>
        <div>
          <ThreeDayForecast />
        </div>
      </div>
    </div>
  );
}
