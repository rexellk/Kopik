import React, { useMemo, useState } from "react";
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

/**
 * Hard-coded café inventory
 * qty = current stock; total = par level; unit = display unit (kg, L, pcs)
 * thresholdPct is used for low-stock detection (defaults to 0.25 if omitted)
 */
const INITIAL_ITEMS = [
  {
    sku: "ING-001",
    name: "All-Purpose Flour",
    category: "Baking",
    unit: "kg",
    qty: 8,
    total: 40,
    cost: 1.2,
  },
  {
    sku: "ING-002",
    name: "Granulated Sugar",
    category: "Baking",
    unit: "kg",
    qty: 5,
    total: 30,
    cost: 1.1,
  },
  {
    sku: "ING-003",
    name: "Unsalted Butter",
    category: "Dairy",
    unit: "kg",
    qty: 3,
    total: 12,
    cost: 4.0,
  },
  {
    sku: "ING-004",
    name: "Whole Milk",
    category: "Dairy",
    unit: "L",
    qty: 18,
    total: 40,
    cost: 0.9,
  },
  {
    sku: "ING-005",
    name: "Fresh Eggs",
    category: "Dairy",
    unit: "pcs",
    qty: 90,
    total: 240,
    cost: 0.2,
  },
  {
    sku: "ING-006",
    name: "Coffee Beans – Espresso",
    category: "Coffee & Tea",
    unit: "kg",
    qty: 6,
    total: 20,
    cost: 9.5,
  },
  {
    sku: "ING-007",
    name: "Coffee Beans – House Blend",
    category: "Coffee & Tea",
    unit: "kg",
    qty: 10,
    total: 25,
    cost: 8.8,
  },
  {
    sku: "ING-008",
    name: "Matcha Powder",
    category: "Coffee & Tea",
    unit: "kg",
    qty: 1,
    total: 6,
    cost: 22.0,
  },
  {
    sku: "ING-009",
    name: "Black Tea Leaves",
    category: "Coffee & Tea",
    unit: "kg",
    qty: 2,
    total: 10,
    cost: 12.0,
  },
  {
    sku: "ING-010",
    name: "Cocoa Powder",
    category: "Baking",
    unit: "kg",
    qty: 2,
    total: 10,
    cost: 6.0,
  },
  {
    sku: "ING-011",
    name: "Vanilla Syrup",
    category: "Syrups",
    unit: "L",
    qty: 3,
    total: 12,
    cost: 7.0,
  },
  {
    sku: "ING-012",
    name: "Caramel Syrup",
    category: "Syrups",
    unit: "L",
    qty: 2,
    total: 12,
    cost: 7.0,
  },
  {
    sku: "ING-013",
    name: "Chocolate Syrup",
    category: "Syrups",
    unit: "L",
    qty: 2,
    total: 12,
    cost: 6.5,
  },
  {
    sku: "ING-014",
    name: "Strawberries (Fresh)",
    category: "Produce",
    unit: "kg",
    qty: 1,
    total: 8,
    cost: 5.0,
  },
  {
    sku: "ING-015",
    name: "Fresh Bananas",
    category: "Produce",
    unit: "kg",
    qty: 1,
    total: 10,
    cost: 2.0,
  },
];

const DEFAULT_THRESHOLD = 0.25;

function ratio(item) {
  const t = Math.max(1, Number(item.total) || 0); // avoid div-by-zero
  return (Number(item.qty) || 0) / t;
}

function dotJoin(arr, max = 6) {
  const names = arr.map((x) => x.name);
  if (names.length <= max) return names.join(" • ");
  return names.slice(0, max).join(" • ") + "…";
}

export default function Inventory() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "name", dir: "asc" }); // key in ["name","category","unit","qty","total","stockPct","cost"]
  const [selected, setSelected] = useState(() => new Set());

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const lowStock = useMemo(() => {
    return items.filter(
      (it) => ratio(it) <= (it.thresholdPct ?? DEFAULT_THRESHOLD)
    );
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const okCat = category === "All" || i.category === category;
      const okText =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q);
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
      return String(a.name).localeCompare(String(b.name)) * dirMul;
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
      setSelected(new Set(sorted.map((i) => i.sku)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleOne(sku) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  }

  function handleDelete() {
    if (selected.size === 0) return;
    setItems((prev) => prev.filter((it) => !selected.has(it.sku)));
    setSelected(new Set());
  }

  function handleAdd() {
    // Minimal stub for now; you can wire this to a modal/form later.
    const idx = items.length + 1;
    const newItem = {
      sku: `ING-${String(idx).padStart(3, "0")}`,
      name: `New Ingredient ${idx}`,
      category: "Misc",
      unit: "pcs",
      qty: 0,
      total: 10,
      cost: 0,
    };
    setItems((p) => [newItem, ...p]);
  }

  const allChecked =
    sorted.length > 0 && sorted.every((i) => selected.has(i.sku));
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      {/* --- AI Insight (Alert style, middle-aligned header row) --- */}
      <Card
        className={
          lowStock.length > 0
            ? "rounded-2xl mb-6 bg-red-50 border border-red-200 shadow-none"
            : "rounded-2xl mb-6 bg-green-50 border border-green-200 shadow-none"
        }
      >
        <CardContent className="py-4 px-5">
          <div className="flex min-h-[48px] items-center gap-2">
            {lowStock.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            <p
              className={
                "text-sm sm:text-base font-semibold " +
                (lowStock.length > 0 ? "text-red-700" : "text-green-700")
              }
            >
              {lowStock.length > 0
                ? `${lowStock.length} item${
                    lowStock.length > 1 ? "s" : ""
                  } need immediate attention`
                : "All good — no items below 25% stock"}
            </p>
          </div>

          <p
            className={
              "mt-2 text-sm sm:text-base " +
              (lowStock.length > 0 ? "text-red-700" : "text-green-800")
            }
          >
            {lowStock.length > 0 ? (
              <>{dotJoin(lowStock, 6)}. Contact suppliers now.</>
            ) : (
              <>
                All categories are healthy. Recheck after today’s service
                window.
              </>
            )}
          </p>
        </CardContent>
      </Card>

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
            className="rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
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
                myKey="name"
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
                label="Unit"
                activeKey={sortBy.key}
                myKey="unit"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Qty"
                activeKey={sortBy.key}
                myKey="qty"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Par (Total)"
                activeKey={sortBy.key}
                myKey="total"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Stock %"
                activeKey={sortBy.key}
                myKey="stockPct"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <SortableTh
                label="Cost (est.)"
                activeKey={sortBy.key}
                myKey="cost"
                dir={sortBy.dir}
                onClick={toggleSort}
              />
              <th className="p-3 text-right pr-4">SKU</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((it) => {
              const pct = ratio(it);
              const pctText = (pct * 100).toFixed(0) + "%";
              const low = pct <= (it.thresholdPct ?? DEFAULT_THRESHOLD);

              return (
                <tr key={it.sku} className="border-t">
                  <td className="p-3">
                    <input
                      aria-label={`Select ${it.name}`}
                      type="checkbox"
                      checked={selected.has(it.sku)}
                      onChange={() => toggleOne(it.sku)}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900">{it.name}</td>
                  <td className="p-3">{it.category}</td>
                  <td className="p-3">{it.unit}</td>
                  <td className="p-3">{it.qty}</td>
                  <td className="p-3">{it.total}</td>
                  <td className="p-3">
                    <span
                      className={
                        "inline-flex items-center gap-2 px-2 py-1 rounded-full " +
                        (low
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200")
                      }
                    >
                      <span className="font-semibold">{pctText}</span>
                    </span>
                  </td>
                  <td className="p-3">${Number(it.cost).toFixed(2)}</td>
                  <td className="p-3 text-right pr-4 text-gray-500">
                    {it.sku}
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
