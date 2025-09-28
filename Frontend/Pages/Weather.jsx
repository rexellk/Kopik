import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
} from "lucide-react";
import { InventoryItem } from "../src/services/entities.js";
import { ApiError } from "../src/services/api.js";

const WeatherIcon = ({ condition, className = "w-8 h-8" }) => {
  switch (condition) {
    case "sunny":
      return <Sun className={`${className} text-yellow-500`} />;
    case "cloudy":
      return <Cloud className={`${className} text-gray-500`} />;
    case "rainy":
      return <CloudRain className={`${className} text-blue-500`} />;
    default:
      return <CloudSun className={`${className} text-blue-400`} />;
  }
};

const WeatherCard = ({ condition, title, description, impact, items }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
  >
    <div className="flex items-center gap-4 mb-4">
      <WeatherIcon condition={condition} className="w-12 h-12" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Demand Impact</span>
        <span
          className={`text-sm font-bold ${
            impact > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {impact > 0 ? "+" : ""}
          {impact}%
        </span>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Affected Items</p>
        <div className="space-y-1">
          {items.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600">{item.name}</span>
              <span className="text-gray-500">{item.sensitivity}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export default function Weather() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeather, setSelectedWeather] = useState("sunny");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const items = await InventoryItem.list();
        setInventory(items);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        setError(err instanceof ApiError ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const weatherScenarios = {
    sunny: {
      title: "Sunny Weather",
      description: "Clear skies and warm temperatures",
      impact: 80,
      items: inventory
        .filter(
          (item) =>
            item.weather_sensitivity?.sunny &&
            item.weather_sensitivity.sunny > 1
        )
        .map((item) => ({
          name: item.name,
          sensitivity: item.weather_sensitivity?.sunny?.toFixed(1) || "1.0",
        })),
    },
    cloudy: {
      title: "Cloudy Weather",
      description: "Overcast skies and mild temperatures",
      impact: 20,
      items: inventory
        .filter(
          (item) =>
            item.weather_sensitivity?.cloudy &&
            item.weather_sensitivity.cloudy > 1
        )
        .map((item) => ({
          name: item.name,
          sensitivity: item.weather_sensitivity?.cloudy?.toFixed(1) || "1.0",
        })),
    },
    rainy: {
      title: "Rainy Weather",
      description: "Precipitation and cooler temperatures",
      impact: 30,
      items: inventory
        .filter(
          (item) =>
            item.weather_sensitivity?.rainy &&
            item.weather_sensitivity.rainy > 1
        )
        .map((item) => ({
          name: item.name,
          sensitivity: item.weather_sensitivity?.rainy?.toFixed(1) || "1.0",
        })),
    },
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Weather Data
          </h2>
          <p className="text-gray-600">
            Analyzing weather impact on inventory...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <CloudSun className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Weather Data Unavailable
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Weather Impact Analysis
          </h1>
          <p className="text-gray-600 mt-1">
            How weather conditions affect your inventory demand
          </p>
        </div>

        <div className="flex gap-2">
          {Object.keys(weatherScenarios).map((weather) => (
            <button
              key={weather}
              onClick={() => setSelectedWeather(weather)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedWeather === weather
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <WeatherIcon condition={weather} className="w-4 h-4" />
              <span className="capitalize">{weather}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Current Weather Analysis */}
      <motion.div
        key={selectedWeather}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <WeatherCard
          condition={selectedWeather}
          {...weatherScenarios[selectedWeather]}
        />
      </motion.div>

      {/* Weather Impact Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-8 h-8 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Temperature Impact</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Hot weather increases cold beverage sales by 150% and ice cream by
            200%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-8 h-8 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Precipitation</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Rain increases coffee and hot beverage demand by 80%, pastry sales
            by 40%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Wind className="w-8 h-8 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Seasonal Trends</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Cloudy days see 30% increase in comfort food and warm drink sales
          </p>
        </div>
      </motion.div>
    </div>
  );
}
