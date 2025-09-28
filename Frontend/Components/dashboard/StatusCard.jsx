import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatusCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  colorClass,
  bgGradient
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-0 shadow-elegant hover:shadow-xl transition-all duration-300">
        <div className={`absolute inset-0 ${bgGradient} opacity-5`} />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10`}>
            <Icon className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
          </div>
        </CardHeader>
        <CardContent className="pt-0 relative z-10">
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center text-sm ${
              trend === 'positive' ? 'text-green-600' : 
              trend === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              <span className="font-medium">{trendValue}</span>
              <span className="ml-1 text-xs">vs yesterday</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}