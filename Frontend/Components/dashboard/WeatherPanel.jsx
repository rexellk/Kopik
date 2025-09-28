import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sun, CloudRain, Cloud, Flame, Thermometer, TrendingUp, TrendingDown } from "lucide-react";

const weatherOptions = [
  {
    id: 'sunny',
    label: 'Sunny',
    icon: Sun,
    temp: '75°F',
    description: 'Clear skies',
    impacts: {
      'Hot Drinks': -30,
      'Cold Drinks': +80,
      'Ice Cream': +120,
      'Outdoor Seating': +60
    },
    bgGradient: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'rainy',
    label: 'Rainy',
    icon: CloudRain,
    temp: '45°F',
    description: 'Light rain',
    impacts: {
      'Hot Drinks': +40,
      'Pastries': +15,
      'Soup': +85,
      'Comfort Food': +25
    },
    bgGradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'cloudy',
    label: 'Cloudy',
    icon: Cloud,
    temp: '65°F',
    description: 'Overcast',
    impacts: {
      'All Items': 0
    },
    bgGradient: 'from-gray-400 to-gray-500'
  },
  {
    id: 'hot',
    label: 'Hot',
    icon: Flame,
    temp: '90°F',
    description: 'Heat wave',
    impacts: {
      'Cold Drinks': +120,
      'Hot Food': -50,
      'Ice Cream': +200,
      'Frozen Items': +90
    },
    bgGradient: 'from-red-500 to-red-600'
  }
];

export default function WeatherPanel({ selectedWeather, onWeatherChange }) {
  const currentWeather = weatherOptions.find(w => w.id === selectedWeather) || weatherOptions[0];

  return (
    <Card className="shadow-elegant border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-blue-600" />
          Weather Impact Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Weather Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {weatherOptions.map((weather) => {
            const Icon = weather.icon;
            return (
              <motion.div key={weather.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={selectedWeather === weather.id ? "default" : "outline"}
                  className={`w-full h-20 flex flex-col gap-1 ${
                    selectedWeather === weather.id 
                      ? `bg-gradient-to-r ${weather.bgGradient} text-white border-0 shadow-lg` 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onWeatherChange(weather.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{weather.label}</span>
                  <span className="text-xs opacity-80">{weather.temp}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Current Weather Display */}
        <div className={`p-4 rounded-xl bg-gradient-to-r ${currentWeather.bgGradient} text-white mb-6`}>
          <div className="flex items-center gap-3">
            <currentWeather.icon className="h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg">{currentWeather.label} Weather</h3>
              <p className="text-sm opacity-90">{currentWeather.temp} - {currentWeather.description}</p>
            </div>
          </div>
        </div>

        {/* Impact Preview */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">Expected Impact:</h4>
          {Object.entries(currentWeather.impacts).map(([item, impact]) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-700">{item}</span>
              <div className="flex items-center gap-2">
                {impact > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : impact < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
                <span className={`font-semibold ${
                  impact > 0 ? 'text-green-600' : 
                  impact < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {impact > 0 ? '+' : ''}{impact}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3-Day Forecast */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">3-Day Forecast Impact</h4>
          <div className="grid grid-cols-3 gap-3">
            {['Today', 'Tomorrow', 'Thursday'].map((day, index) => (
              <div key={day} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 text-sm">{day}</p>
                <currentWeather.icon className="h-5 w-5 mx-auto my-2 text-gray-600" />
                <p className="text-xs text-gray-600">{currentWeather.temp}</p>
                <p className="text-xs font-medium text-green-600 mt-1">+${(120 + index * 30).toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}