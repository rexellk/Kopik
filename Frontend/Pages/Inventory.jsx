import React, { useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// If you use shadcn/ui, keep these. Otherwise replace with your own primitives.
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataContext } from "../src/context/DataContext";
import AddProductForm from "../Components/AddProductForm";
import { inventoryAPI } from "../src/services/api";

const DEFAULT_THRESHOLD = 0.25;

function ratio(item) {
  const t = Math.max(1, Number(item.total) || 0); // avoid div-by-zero
  return (Number(item.qty) || 0) / t;
}

function dotJoin(arr, max = 6) {
  const names = arr.map((x) => x.title);
  if (names.length <= max) return names.join(" • ");
  return names.slice(0, max).join(" • ") + "…";
}

export default function Inventory() {
  const { data, loading, error, refetchData } = useContext(DataContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "name", dir: "asc" }); // key in ["name","category","unit","qty","total","stockPct","cost"]
  const [selected, setSelected] = useState(() => new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data.</div>;
  }

  // Map backend inventory structure to frontend expected structure
  const items = (data.inventory || []).map(item => ({
    id: item.id,
    title: item.name, // Backend uses 'name', frontend expects 'title'
    category: item.category,
    qty: item.current_stock, // Backend uses 'current_stock', frontend expects 'qty'
    total: item.reorder_point, // Backend uses 'reorder_point', frontend expects 'total'
    unit: item.unit,
    cost: item.cost_per_unit,
    supplier: item.supplier,
    sku: item.sku,
    // Keep original item for additional data
    ...item
  }));

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const lowStock = useMemo(() => {
    return items.filter(
      (it) => it.type === 'low_stock'
    );
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const okCat = category === "All" || i.category === category;
      const okText =
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q);
      return okCat && okText;
    });
  }, [items, category, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dirMul = sortBy.dir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      let av, bv;
      switch (sortBy.key) {
        case "qty":
        case "total":
        case "cost":
          av = Number(a[sortBy.key]) || 0;
          bv = Number(b[sortBy.key]) || 0;
          break;
        case "stockPct":
          av = ratio(a);
          bv = ratio(b);
          break;
        default:
          av = String(a[sortBy.key] ?? "").toLowerCase();
          bv = String(b[sortBy.key] ?? "").toLowerCase();
      }

      if (av < bv) return -1 * dirMul;
      if (av > bv) return 1 * dirMul;
      // Stable secondary sort by name
      return String(a.title).localeCompare(String(b.title)) * dirMul;
    });
    return arr;
  }, [filtered, sortBy]);

  function toggleSort(key) {
    setSortBy((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  }

  function toggleAll(checked) {
    if (checked) {
      setSelected(new Set(sorted.map((i) => i.id)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (selected.size === 0) {
      alert("Please select items to delete.");
      return;
    }

    const selectedItems = Array.from(selected);
    const itemNames = selectedItems.map(id => {
      const item = items.find(i => i.id === id);
      return item ? item.title : `ID: ${id}`;
    });

    const confirmMessage = `Are you sure you want to delete ${selectedItems.length} item(s)?\n\n${itemNames.join('\n')}\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // Delete each selected item
      const deletePromises = selectedItems.map(id => {
        const item = items.find(i => i.id === id);
        if (item && item.item_id) {
          return inventoryAPI.delete(item.item_id);
        }
        return Promise.resolve();
      });

      await Promise.all(deletePromises);
      
      // Clear selection
      setSelected(new Set());
      
      // Refresh data
      if (refetchData) {
        await refetchData();
      }
      
      alert(`Successfully deleted ${selectedItems.length} item(s).`);
      
      // Redirect to dashboard and reload to ensure fresh data
      navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      alert(`Failed to delete items: ${error.message}`);
    }
  }

  function handleAdd() {
    setShowAddForm(true);
  }

  async function handleAddProduct(productData) {
    try {
      await inventoryAPI.create(productData);
      // Refresh the data to show the new product
      if (refetchData) {
        await refetchData();
      }
    } catch (error) {
      throw new Error(error.message || "Failed to add product");
    }
  }

  const allChecked =
    sorted.length > 0 && sorted.every((i) => selected.has(i.id));
  const someChecked = selected.size > 0 && !allChecked;


  // Get sample alerts from React context (should be from sample_frontend_response.json)
  const sampleAlerts = data?.alerts ? data.alerts.slice(0, 3) : [];

  // Map priority to colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600'
        };
      case 'medium':
        return {
          bg: 'bg-white',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600'
        };
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      {/* --- Alert Boxes from Sample Data --- */}
      <div className="space-y-4 mb-6">
        {sampleAlerts.length > 0 ? (
          sampleAlerts.map((alert) => {
            const colors = getPriorityColor(alert.priority);
            return (
              <Card
                key={alert.id}
                className={`rounded-2xl ${colors.bg} ${colors.border} shadow-none`}
              >
                <CardContent className="py-6 px-6">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className={`w-6 h-6 ${colors.icon} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-base pt-5 font-semibold ${colors.text} mb-1`}>
                        {alert.title || alert.name || 'Alert'}
                      </p>
                      <p className={`text-sm ${colors.text}`}>
                        {alert.message || alert.summary || 'No message'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-5 ">
                      <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {(alert.priority || 'medium')?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="rounded-2xl bg-gray-50 border border-gray-200 shadow-none">
            <CardContent className="py-4 px-5">
              <div className="flex min-h-[48px] items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gray-600" />
                <p className="text-sm sm:text-base font-semibold text-gray-700">
                  N/A
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- Top Bar: actions & filters --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleAdd} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={selected.size === 0}
            className="rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Text search (optional helper) */}
          <Input
            placeholder="Search name / SKU…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56"
          />

          {/* Category filter ONLY (sorting happens via column headers) */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-300 bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Inventory Table --- */}
      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600">
              <th className="w-10 p-3">
                <input
                  aria-label="Select all"
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (!el) return;
                    el.indeterminate = someChecked;
                  }}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>

              <SortableTh
                label="Name"
                activeKey={sortBy.key}
                myKey="title"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Category"
                activeKey={sortBy.key}
                myKey="category"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Quantity"
                activeKey={sortBy.key}
                myKey="qty"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <th className="p-3 text-right">ID</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((it) => {
              return (
                <tr key={it.id} className="border-t">
                  <td className="p-3">
                    <input
                      aria-label={`Select ${it.title}`}
                      type="checkbox"
                      checked={selected.has(it.id)}
                      onChange={() => toggleOne(it.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900">{it.title}</td>
                  <td className="p-3">{it.category}</td>
                  <td className="p-3">{it.qty} {it.unit}</td>
                  <td className="p-3 text-right pr-4 text-gray-500">
                    {it.id}
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  No items match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Form Modal */}
      <AddProductForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddProduct}
      />
    </div>
  );
}

/** Sortable table header cell */
function SortableTh({ label, myKey, activeKey, dir, onClick }) {
  const active = activeKey === myKey;
  return (
    <th
      scope="col"
      className={
        "p-3 select-none cursor-pointer text-left " +
        (active ? "text-gray-900" : "text-gray-600 hover:text-gray-800")
      }
      onClick={() => onClick(myKey)}
      title="Click to sort"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        ) : null}
      </span>
    </th>
  );
}
