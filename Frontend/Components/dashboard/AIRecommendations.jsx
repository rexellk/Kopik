import React from "react";
import { motion } from "framer-motion";
import { Brain, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Props
 * - recommendations: Array<{
 *    priority: 'low' | 'medium' | 'high',
 *    title: string,
 *    description?: string,
 *    profit_impact?: number,
 *    confidence?: number,
 *    action_required?: boolean,
 *    category?: string,
 *    trigger_sources?: string[]
 * }>
 * - onApplyRecommendation?: (rec) => void
 */
export default function AIRecommendations({
  recommendations = [],
  onApplyRecommendation = () => {},
}) {
  const priorityMap = {
    low: {
      badge: "LOW PRIORITY",
      bg: "bg-blue-50",
      chip: "bg-blue-100 text-blue-700",
      border: "border-blue-200",
      icon: ShieldCheck,
      dollar: "text-emerald-600",
    },
    medium: {
      badge: "MEDIUM PRIORITY",
      bg: "bg-amber-50",
      chip: "bg-amber-100 text-amber-800",
      border: "border-amber-200",
      icon: Zap,
      dollar: "text-emerald-600",
    },
    high: {
      badge: "HIGH PRIORITY",
      bg: "bg-red-50",
      chip: "bg-red-100 text-red-700",
      border: "border-red-200",
      icon: AlertTriangle,
      dollar: "text-emerald-600",
    },
  };

  // Limit to top 3 to avoid overpopulating the dashboard
  const limited = recommendations.slice(0, 3);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">AI Recommendations</h2>
        <span className="text-sm text-gray-500 ml-auto">Sorted by Priority & Impact</span>
      </div>

      {/* Equal-height columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {limited.map((rec, idx) => {
          const pri = priorityMap[rec.priority?.toLowerCase?.() || "low"];
          const Icon = pri.icon;
          return (
            <motion.div
              key={`${rec.title}-${idx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <Card
                className={`h-full flex flex-col rounded-2xl overflow-hidden border ${pri.border}`}
              >
                <CardHeader className={`${pri.bg} pb-4`}>
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${pri.chip}`}
                    >
                      {pri.badge}
                    </span>
                    {typeof rec.confidence === "number" && (
                      <span className="text-gray-600 text-xs">
                        {rec.confidence}% confidence
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 text-gray-700" />
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                  </div>
                </CardHeader>

                {/* flex-1 makes contents fill remaining height so all cards match */}
                <CardContent className="flex-1 flex flex-col pt-4 space-y-3">
                  {rec.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {rec.description}
                    </p>
                  )}

                  <div className="text-sm">
                    <div className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <Zap className="h-4 w-4 text-blue-600" /> AI TRIGGERS
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(rec.tags || []).length > 0 ? (
                        rec.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          No triggers listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* optional footer space to pin CTA if you add one later */}
                  {/* <div className="mt-auto pt-2">
                    <Button size="sm" className="rounded-xl" onClick={() => onApplyRecommendation(rec)}>Apply</Button>
                  </div> */}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {limited.length === 0 && (
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-base text-gray-600">
              No recommendations yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            Insights will appear here as signals and forecasts update.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
