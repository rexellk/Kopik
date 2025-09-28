import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Megaphone,
  TrendingUp,
  TrendingDown,
  Landmark,
  Bell,
} from "lucide-react";

/**
 * IntelligenceFeed — clean, compact feed like the screenshot
 * Props:
 *  - intelligenceSignals: Array<{
 *      name: string,
 *      summary?: string,
 *      category?: 'Event' | 'Social' | 'Economic' | 'Calendar' | string,
 *      impactPct?: number,            // positive/negative number
 *      trend?: 'up' | 'down',         // if missing, derived from impactPct
 *    }>
 */
export default function IntelligenceFeed({ intelligenceSignals = [] }) {
  const [tab, setTab] = useState("All");

  const categories = useMemo(() => {
    const base = ["All", "Event", "Social", "Economic", "Calendar"]; // fixed order in UI
    const fromData = Array.from(
      new Set(intelligenceSignals.map((s) => s.category).filter(Boolean))
    );
    return base.concat(fromData.filter((c) => !base.includes(c)));
  }, [intelligenceSignals]);

  const items = useMemo(() => {
    const data = intelligenceSignals.map((s) => ({
      ...s,
      trend:
        s.trend ||
        (typeof s.impactPct === "number" && s.impactPct < 0 ? "down" : "up"),
    }));
    return tab === "All"
      ? data
      : data.filter(
          (s) => (s.category || "").toLowerCase() === tab.toLowerCase()
        );
  }, [intelligenceSignals, tab]);

  const iconFor = (cat) => {
    const k = (cat || "").toLowerCase();
    if (k === "event") return Calendar; // calendar icon for events in screenshot style
    if (k === "social") return Megaphone;
    if (k === "economic") return Landmark;
    if (k === "calendar") return Calendar;
    return Bell;
  };

  return (
    <section className="h-full">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <h3 className="text-lg font-semibold">Intelligence Hub</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setTab(c)}
            className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border transition-colors ${
              tab === c
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Scrollable list */}
      <div className="mt-3 max-h-[520px] overflow-auto pr-1 space-y-3">
        {items.map((s, i) => {
          const Icon = iconFor(s.category);
          const isDown = (s.trend || "").toLowerCase() === "down";
          const change =
            typeof s.impactPct === "number"
              ? `${isDown ? "-" : "+"}${Math.abs(s.impactPct)}%`
              : null;
          return (
            <motion.div
              key={`${s.name}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* left: icon + text */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 leading-snug">
                        {s.name}
                      </div>
                      {s.summary && (
                        <p className="text-sm text-gray-600 mt-0.5 leading-snug">
                          {s.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* right: change */}
                  {change && (
                    <div
                      className={`text-sm font-semibold flex items-center gap-1 ${
                        isDown ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {isDown ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                      {change}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}

        {items.length === 0 && (
          <div className="text-sm text-gray-500 py-8 text-center">
            No signals for this tab.
          </div>
        )}
      </div>
    </section>
  );
}
