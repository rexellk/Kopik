// Frontend/Pages/Order.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import AddProductForm from "../Components/AddProductForm";
import { inventoryAPI, ordersAPI } from "../src/services/api";
import { DataContext } from "../src/context/DataContext";

export default function Order() {
  const dataCtx = useContext(DataContext);
  const data = dataCtx?.data || {};

  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All"); // status filter
  const [sortBy, setSortBy] = useState({ key: "created_at", dir: "desc" });
  const [selected, setSelected] = useState(() => new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pull alerts for Orders from DataContext (AI-like insights)
  const orderAlerts = (data?.order_alerts || []).slice(0, 3);

  // --- Match Inventory.jsx color mapping exactly ---
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: "text-red-600",
        };
      case "medium":
        return {
          bg: "bg-white",
          border: "border-yellow-200",
          text: "text-yellow-700",
          icon: "text-yellow-600",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          icon: "text-blue-600",
        };
    }
  };
  // -------------------------------------------------

  const currency = (n) =>
    (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const humanize = (s) =>
    typeof s === "string"
      ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : s;

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await ordersAPI.list({ skip: 0, limit: 100 });
      const mapped = (data || []).map((o) => {
        const rawStatus =
          typeof o.status === "string" ? o.status : o.status?.value ?? "";
        return {
          id: o.id,
          title: humanize(o.item_id) || `Order #${o.id}`,
          status: rawStatus ? String(rawStatus).toUpperCase() : "—",
          quantity_ordered: Number(o.quantity_ordered ?? 0),
          unit_cost: Number(o.unit_cost ?? 0),
          total: Number(o.total_cost ?? 0),
          eta: o.expected_delivery || "",
          created_at: o.order_date || "",
          actual_delivery: o.actual_delivery || "",
          notes: o.notes || "",
          supplier: o.supplier || "—",
          item_id: o.item_id,
          // keep originals
          ...o,
        };
      });
      setOrders(mapped);
    } catch (err) {
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(
      orders.map((o) => o.status).filter((s) => s && s !== "—")
    );
    return ["All", ...Array.from(set).sort()];
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const okCat = category === "All" || o.status === category;
      const okText =
        !q ||
        String(o.title ?? "")
          .toLowerCase()
          .includes(q) ||
        String(o.status ?? "")
          .toLowerCase()
          .includes(q) ||
        String(o.notes ?? "")
          .toLowerCase()
          .includes(q);
      return okCat && okText;
    });
  }, [orders, category, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dirMul = sortBy.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let av = a[sortBy.key];
      let bv = b[sortBy.key];

      if (["total", "unit_cost", "quantity_ordered"].includes(sortBy.key)) {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else if (
        ["created_at", "eta", "actual_delivery"].includes(sortBy.key)
      ) {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      } else {
        av = String(av ?? "");
        bv = String(bv ?? "");
      }

      if (av < bv) return -1 * dirMul;
      if (av > bv) return 1 * dirMul;
      return String(a.title).localeCompare(String(b.title)) * dirMul;
    });
    return arr;
  }, [filtered, sortBy]);

  function toggleSort(key) {
    setSortBy((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  function toggleAll(checked) {
    if (checked) setSelected(new Set(sorted.map((o) => o.id)));
    else setSelected(new Set());
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
      alert("Please select orders to delete.");
      return;
    }
    const ids = Array.from(selected);
    const names = ids
      .map((id) => sorted.find((o) => o.id === id)?.title || `ID: ${id}`)
      .join("\n");

    const confirmMessage = `Are you sure you want to delete ${ids.length} order(s)?\n\n${names}\n\nThis action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    try {
      await Promise.all(ids.map((id) => ordersAPI.delete(id)));
      setSelected(new Set());
      await fetchOrders();
      alert(`Deleted ${ids.length} order(s).`);
    } catch (e) {
      alert(`Failed to delete orders: ${e.message}`);
    }
  }

  function handleAdd() {
    setShowAddForm(true);
  }

  async function handleAddProduct(productData) {
    await inventoryAPI.create(productData);
    setShowAddForm(false);
  }

  // New: Order Again – clone an order as a new pending order
  async function orderAgain(o) {
    try {
      const today = new Date();
      const plus3 = new Date(today);
      plus3.setDate(today.getDate() + 3);

      const payload = {
        item_id: o.item_id,
        supplier: o.supplier !== "—" ? o.supplier : null,
        quantity_ordered: o.quantity_ordered,
        unit_cost: o.unit_cost,
        total_cost: Number((o.quantity_ordered || 0) * (o.unit_cost || 0)),
        order_date: today.toISOString().slice(0, 10),
        expected_delivery: plus3.toISOString().slice(0, 10),
        actual_delivery: null,
        status: "pending",
        notes: `Reordered based on prior order #${o.id}`,
      };

      await ordersAPI.create(payload);
      await fetchOrders();
      alert("Order placed again.");
    } catch (e) {
      alert(`Failed to order again: ${e.message}`);
    }
  }

  const allChecked =
    sorted.length > 0 && sorted.every((o) => selected.has(o.id));
  const someChecked = selected.size > 0 && !allChecked;

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      {/* --- Alert Boxes (identical style to Inventory.jsx) --- */}
      {orderAlerts?.length > 0 && (
        <div className="space-y-4 mb-6">
          {orderAlerts.map((alert) => {
            const colors = getPriorityColor(alert.priority);
            return (
              <Card
                key={alert.id}
                className={`rounded-2xl ${colors.bg} ${colors.border} shadow-none`}
              >
                <CardContent className="py-6 px-6">
                  <div className="flex items-center gap-4">
                    <AlertTriangle
                      className={`w-6 h-6 ${colors.icon} flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-base pt-5 font-semibold ${colors.text} mb-1`}
                      >
                        {alert.title || alert.name || "Alert"}
                      </p>
                      <p className={`text-sm ${colors.text}`}>
                        {alert.message || alert.summary || "No message"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-5">
                      <span
                        className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                      >
                        {(alert.priority || "medium")?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* --- Top Bar: actions & filters (mirrors Inventory) --- */}
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
            Delete {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-300 bg-white"
            title="Filter by status"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders table */}
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
                label="Order"
                myKey="title"
                activeKey={sortBy.key}
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Status"
                myKey="status"
                activeKey={sortBy.key}
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Qty"
                myKey="quantity_ordered"
                activeKey={sortBy.key}
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Unit Cost"
                myKey="unit_cost"
                activeKey={sortBy.key}
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Total"
                myKey="total"
                activeKey={sortBy.key}
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="ETA"
                myKey="eta"
                activeKey={sortBy.key}
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Created"
                myKey="created_at"
                activeKey={sortBy.key}
                dir={sortBy.dir}
                onClick={toggleSort}
              />
            </tr>
          </thead>
          <tbody>
            {sorted.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">
                  <input
                    aria-label={`Select ${o.title}`}
                    type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={() => toggleOne(o.id)}
                  />
                </td>
                <td className="p-3 font-medium text-gray-900">{o.title}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">{o.quantity_ordered}</td>
                <td className="p-3">{currency(o.unit_cost)}</td>
                <td className="p-3">{currency(o.total)}</td>
                <td className="p-3">
                  {o.eta ? new Date(o.eta).toLocaleDateString() : "—"}
                </td>
                <td className="p-3">
                  {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <Button size="sm" onClick={() => orderAgain(o)}>
                    Order Again
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  No orders found.
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

function SortableTh({ label, myKey, activeKey, dir, onClick }) {
  const active = activeKey === myKey;
  return (
    <th
      scope="col"
      className={`p-3 select-none cursor-pointer text-left ${
        active ? "text-gray-900" : "text-gray-600 hover:text-gray-800"
      }`}
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
