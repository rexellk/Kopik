import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Coffee, Milk, Wheat, Apple, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const getItemIcon = (category) => {
  switch (category) {
    case 'Beverages': return Coffee;
    case 'Dairy': return Milk;
    case 'Baking': return Wheat;
    case 'Produce': return Apple;
    default: return Package;
  }
};

const getStatusInfo = (status) => {
  switch (status) {
    case 'critical':
      return { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: AlertTriangle,
        label: 'Critical' 
      };
    case 'low':
      return { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        label: 'Low Stock' 
      };
    case 'good':
      return { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        label: 'Good' 
      };
    default:
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: Package,
        label: 'Unknown' 
      };
  }
};

export default function InventoryGrid({ inventoryData, onReorder }) {
  const [sortBy, setSortBy] = useState('daysLeft');
  
  const sortedData = [...inventoryData].sort((a, b) => {
    if (sortBy === 'daysLeft') return a.daysLeft - b.daysLeft;
    if (sortBy === 'status') {
      const statusPriority = { critical: 0, low: 1, good: 2 };
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="shadow-elegant border-0">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Current Inventory
          </CardTitle>
          <select 
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="daysLeft">Sort by Days Left</option>
            <option value="status">Sort by Status</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Item</TableHead>
                <TableHead className="font-semibold text-gray-700">Stock</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Days Left</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {sortedData.map((item) => {
                  const Icon = getItemIcon(item.category);
                  const statusInfo = getStatusInfo(item.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{item.currentStock} {item.unit}</p>
                          <p className="text-sm text-gray-500">Reorder at {item.reorderPoint}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} border flex items-center gap-1 w-fit`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className={`font-semibold ${item.daysLeft <= 2 ? 'text-red-600' : item.daysLeft <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {item.daysLeft}
                          </p>
                          <p className="text-sm text-gray-500">days</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.status === 'critical' && (
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => onReorder(item)}
                          >
                            Order Now
                          </Button>
                        )}
                        {item.status === 'low' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                            onClick={() => onReorder(item)}
                          >
                            Plan Order
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}