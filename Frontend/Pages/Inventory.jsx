import React, { useState, useEffect } from "react";
import { InventoryItem } from "../Entities/all.js";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Package,
  Coffee,
  Milk,
  Wheat,
  Apple,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  List,
  Bell,
  Upload,
  Search,
} from "lucide-react";
import { format } from "date-fns";

const getItemIcon = (category) => {
  switch (category) {
    case "Beverages":
      return <Coffee className="h-6 w-6 text-blue-700" />;
    case "Dairy":
      return <Milk className="h-6 w-6 text-blue-700" />;
    case "Baking Ingredients":
      return <Wheat className="h-6 w-6 text-blue-700" />;
    case "Produce":
      return <Apple className="h-6 w-6 text-blue-700" />;
    default:
      return <Package className="h-6 w-6 text-blue-700" />;
  }
};

const getDaysColor = (days) => {
  if (days <= 3) return "text-red-600";
  if (days <= 7) return "text-yellow-600";
  return "text-green-600";
};

const getStatusStyle = (status) => {
  switch (status) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "low":
      return "bg-yellow-100 text-yellow-800";
    case "good":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const InventoryRow = ({ item }) => (
  <TableRow className="hover:bg-gray-50/50 border-b border-gray-100">
    <TableCell className="px-6 py-4">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
          {getItemIcon(item.category)}
        </div>
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">
            {item.category} • {item.supplier}
          </div>
          <div className="text-xs text-gray-400">SKU: {item.sku}</div>
        </div>
      </div>
    </TableCell>
    <TableCell className="px-6 py-4">
      <div className="text-lg font-semibold">
        {item.current_stock} {item.unit}
      </div>
      <div className="text-sm text-gray-500">
        Reorder at {item.reorder_point} {item.unit}
      </div>
      <div className="text-xs text-gray-400">
        Cost: ${item.cost_per_unit}/unit
      </div>
    </TableCell>
    <TableCell className="px-6 py-4">
      <div className="flex items-center">
        <span className="text-sm">
          {item.daily_usage} {item.unit}/day
        </span>
        <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
      </div>
      <div className="text-xs text-gray-500">7-day average</div>
    </TableCell>
    <TableCell className="px-6 py-4">
      <div className={`text-lg font-bold ${getDaysColor(item.daysRemaining)}`}>
        {item.daysRemaining} days
      </div>
      <div className="text-xs text-gray-500">Until stock depleted</div>
    </TableCell>
    <TableCell className="px-6 py-4">
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
          item.status
        )}`}
      >
        {item.status.toUpperCase()}
      </span>
    </TableCell>
    <TableCell className="px-6 py-4">
      <div className="font-medium text-blue-600">
        Order {item.ai_suggestion} {item.unit}
      </div>
      <div className="text-xs text-gray-500">AI recommendation</div>
    </TableCell>
    <TableCell className="px-6 py-4">
      <div className="flex space-x-2">
        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          Quick Order
        </Button>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("daysRemaining");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      const items = await InventoryItem.list();
      const processedItems = items.map((item) => {
        const daysRemaining = Math.floor(item.current_stock / item.daily_usage);
        let status = "good";
        if (daysRemaining <= 3) status = "critical";
        else if (daysRemaining <= 7) status = "low";
        return { ...item, daysRemaining, status };
      });
      setInventory(processedItems);
      setIsLoading(false);
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    let result = [...inventory];
    if (searchTerm) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }
    result.sort((a, b) => {
      if (sortBy === "daysRemaining") return a.daysRemaining - b.daysRemaining;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    setFilteredInventory(result);
  }, [inventory, searchTerm, categoryFilter, statusFilter, sortBy]);

  const criticalCount = inventory.filter((i) => i.status === "critical").length;
  const lowCount = inventory.filter((i) => i.status === "low").length;
  const avgDaysRemaining = Math.round(
    inventory.reduce((acc, i) => acc + i.daysRemaining, 0) /
      (inventory.length || 1)
  );
  const categories = [...new Set(inventory.map((i) => i.category))];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Current Inventory
            </h1>
            <p className="text-gray-500 mt-1">
              Last updated: {format(new Date(), "PPpp")}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-bold text-red-600 text-xl">{criticalCount}</p>
              <p className="text-xs text-gray-500">Critical Items</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-yellow-600 text-xl">{lowCount}</p>
              <p className="text-xs text-gray-500">Low Stock</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-600 text-xl">
                {avgDaysRemaining}
              </p>
              <p className="text-xs text-gray-500">Avg. Days Left</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Critical Alerts Banner */}
      {criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="font-semibold text-red-800">
              {criticalCount} items need immediate attention
            </span>
          </div>
          <div className="mt-2 text-sm text-red-700">
            {inventory
              .filter((i) => i.status === "critical")
              .slice(0, 3)
              .map((i) => i.name)
              .join(" • ")}
            ... Contact suppliers now.
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="shadow-elegant border-0">
            <CardContent className="p-0">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search inventory..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daysRemaining">
                      Sort by Days Remaining
                    </SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="px-6 py-3 font-semibold text-gray-700">
                        Item
                      </TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-gray-700">
                        Current Stock
                      </TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-gray-700">
                        Daily Usage
                      </TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-gray-700">
                        Days Remaining
                      </TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-gray-700">
                        Reorder Suggestion
                      </TableHead>
                      <TableHead className="px-6 py-3 font-semibold text-gray-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          Loading inventory...
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => (
                        <InventoryRow key={item.id} item={item} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-elegant border-0">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Bulk Order Critical Items
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <List className="w-4 h-4" />
                  Generate Shopping List
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Bell className="w-4 h-4" />
                  Set Reorder Alerts
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Upload className="w-4 h-4" />
                  Import from POS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
