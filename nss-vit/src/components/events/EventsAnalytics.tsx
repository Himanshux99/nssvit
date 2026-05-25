/**
 * ╻ NSS-VIT
 * ┃ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ┃ Not Me, But You
 * ┃
 * ┃ EventsAnalytics.tsx
 * ╹ src/components/events/
 *
 * Analytics dashboard section for the Events page.
 * Renders KPI cards + per-category breakdown.
 * Receives a normalized `analyticsStats` prop — source-agnostic.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  Pie,
  PieChart,
  Cell,
  Label,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryColor?: { hex: string };
  eventsCount: number;
  hoursCount: number;
}

export interface AnalyticsStats {
  totalEventsCompleted: number;
  totalHoursCompleted: number;
  totalBeneficiaries: number;
  categoryStats: CategoryStat[];
  /** 'auto' | 'manual' | 'api' — only shown to admins  */
  dataSource: "auto" | "manual" | "api";
}

// ─── Category Icons ────────────────────────────────────────────────────────────

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.includes("environ") ||
    lower.includes("green") ||
    lower.includes("plant") ||
    lower.includes("clean")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
        />
      </svg>
    );
  }
  if (
    lower.includes("edu") ||
    lower.includes("literacy") ||
    lower.includes("school") ||
    lower.includes("teach")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    );
  }
  if (
    lower.includes("welfare") ||
    lower.includes("community") ||
    lower.includes("social") ||
    lower.includes("health")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    );
  }
  if (
    lower.includes("univ") ||
    lower.includes("college") ||
    lower.includes("campus")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    );
  }
  if (
    lower.includes("area") ||
    lower.includes("local") ||
    lower.includes("base")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sublabel,
  icon,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="bg-white border border-swiss-gray-200 p-5 sm:p-6 flex items-start gap-4 group hover:border-primary/40 hover:shadow-sm transition-all duration-300"
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider font-semibold text-swiss-gray-500 mb-1">
          {label}
        </div>
        <div className="text-3xl sm:text-2xl font-extrabold text-text leading-none tracking-tight">
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </div>
        {sublabel && (
          <div className="text-xs text-swiss-gray-400 mt-1">{sublabel}</div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Category Analytics Card ──────────────────────────────────────────────────

function CategoryAnalyticsCard({
  stat,
  index,
  totalEvents,
  totalHours,
}: {
  stat: CategoryStat;
  index: number;
  totalEvents: number;
  totalHours: number;
}) {
  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];
  const accent = stat.categoryColor?.hex || COLORS[index % COLORS.length];
  const eventsPercent =
    totalEvents > 0 ? Math.round((stat.eventsCount / totalEvents) * 100) : 0;
  const hoursPercent =
    totalHours > 0 ? Math.round((stat.hoursCount / totalHours) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.07 }}
      className="bg-white border-x border-y border-swiss-gray-200 p-4 sm:p-5 hover:shadow-sm transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          {getCategoryIcon(stat.categoryName)}
        </div>
        <h3 className="font-bold text-text text-base leading-snug line-clamp-1">
          {stat.categoryName}
        </h3>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-swiss-gray-500">
              Events
            </span>
            <span className="text-base font-bold text-text">
              {stat.eventsCount}
            </span>
          </div>
          <div className="h-1.5 bg-swiss-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${eventsPercent}%` }}
              transition={{
                duration: 0.8,
                delay: 0.2 + index * 0.07,
                ease: "easeOut",
              }}
              className="h-full rounded-full"
              style={{ backgroundColor: accent }}
            />
          </div>
          <div className="text-xs text-swiss-gray-500 mt-0.5">
            {eventsPercent}% of total
          </div>
        </div>

        {/* Hours */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-swiss-gray-500">
              Hours
            </span>
            <span className="text-base font-bold text-text">
              {stat.hoursCount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="h-1.5 bg-swiss-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hoursPercent}%` }}
              transition={{
                duration: 0.8,
                delay: 0.25 + index * 0.07,
                ease: "easeOut",
              }}
              className="h-full rounded-full opacity-70"
              style={{ backgroundColor: accent }}
            />
          </div>
          <div className="text-xs text-swiss-gray-500 mt-0.5">
            {hoursPercent}% of total
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Donut Chart Component ───────────────────────────────────────────────────

function DonutChart({ categoryStats }: { categoryStats: CategoryStat[] }) {
  const totalEvents = categoryStats.reduce((sum, c) => sum + c.eventsCount, 0);

  if (totalEvents === 0) {
    return (
    <Card className="bg-white rounded-none border border-swiss-gray-200 shadow-xs w-full h-full flex flex-col">
        <CardHeader className="pb-0">
          <CardTitle className="text-xs uppercase tracking-wider">
            EVENTS DISTRIBUTION BY CATEGORY
          </CardTitle>
          <CardDescription>Event count share per category</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-swiss-gray-400 text-sm font-medium">
          No Event Data Available
        </CardContent>
      </Card>
    );
  }

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const chartData = categoryStats.map((c, i) => ({
    category: c.categoryName,
    events: c.eventsCount,
    fill: c.categoryColor?.hex || COLORS[i % COLORS.length],
  }));

  const chartConfig = {
    events: {
      label: "Events",
    },
    ...categoryStats.reduce((acc, c, i) => {
      acc[c.categoryName] = {
        label: c.categoryName,
        color: c.categoryColor?.hex || COLORS[i % COLORS.length],
      };
      return acc;
    }, {} as any),
  } satisfies ChartConfig;

  return (
    <Card className="bg-white rounded-none border border-swiss-gray-200 shadow-xs w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold tracking-wide text-text">
          Events Distribution
        </CardTitle>
        <CardDescription className="text-sm text-swiss-gray-500">
          Categories and contribution
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start md:items-center">
          <div className="relative flex justify-center">
            <ChartContainer
              config={chartConfig}
              className="h-[280px] w-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="events"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    strokeWidth={0}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      if (percent * 100 < 8) return null;

                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-bold text-sm"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}

                    <Label
                      content={({ viewBox }) => {
                        if (
                          !viewBox ||
                          !("cx" in viewBox) ||
                          !("cy" in viewBox)
                        )
                          return null;

                        const cx = viewBox.cx;
                        const cy = viewBox.cy ?? 0;

                        return (
                          <text x={cx} y={cy} textAnchor="middle">
                            <tspan
                              x={cx}
                              y={cy - 5}
                              className="text-5xl font-extrabold fill-black"
                            >
                              {totalEvents}
                            </tspan>

                            <tspan
                              x={cx}
                              y={cy + 22}
                              className="fill-swiss-gray-500 text-xs uppercase tracking-wider font-semibold"
                            >
                              TOTAL EVENTS
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Compact category list */}
          <div className="space-y-3 w-full">
            {categoryStats.map((seg, i) => {
              const accent =
                seg.categoryColor?.hex || COLORS[i % COLORS.length];

              return (
                <div
                  key={seg.categoryId}
                  className="flex justify-between border-b border-swiss-gray-300 items-center pb-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: accent,
                      }}
                    />

                    <span className="text-sm sm:text-base font-semibold text-text">
                      {seg.categoryName}
                    </span>
                  </div>

                  <span className="font-semibold text-xs sm:text-lg text-text">
                    {seg.eventsCount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bar Chart Component ─────────────────────────────────────────────────────

function BarChart({ categoryStats }: { categoryStats: CategoryStat[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const chartData = categoryStats.map((c, i) => ({
    category: c.categoryName,
    hours: c.hoursCount,
    events: c.eventsCount,
    fill: c.categoryColor?.hex || COLORS[i % COLORS.length],
  }));

  const chartConfig = {
    hours: {
      label: "Hours",
    },
    ...categoryStats.reduce((acc, c, i) => {
      acc[c.categoryName] = {
        label: c.categoryName,
        color: c.categoryColor?.hex || COLORS[i % COLORS.length],
      };
      return acc;
    }, {} as any),
  } satisfies ChartConfig;

  return (
    <Card className="bg-white border rounded-none border-swiss-gray-200 shadow-xs w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold tracking-wide text-text">
          Hours Contributed
        </CardTitle>
        <CardDescription className="text-sm text-swiss-gray-500">
          Total service hours per category
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0 md:pb-4">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[340px] sm:h-[280px] mx-auto"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={chartData}
              margin={{ top: 25, right: 10, left: -20, bottom: isMobile ? 70 : 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={isMobile ? 80 : 30}
                tickMargin={isMobile ? 18 : 10}
                angle={isMobile ? -90 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                tickFormatter={(value) =>
                  value.length > 20 ? value.slice(0, 20) + "..." : value
                }
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="hours"
                  position="top"
                  fontSize={14}
                  fontWeight="bold"
                  fill="#4b5563"
                  formatter={(val: any) => `${val} hrs`}
                />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// ─── Main Analytics Section ───────────────────────────────────────────────────

export default function EventsAnalytics({ stats }: { stats: AnalyticsStats }) {
  const {
    totalEventsCompleted,
    totalHoursCompleted,
    totalBeneficiaries,
    categoryStats,
    dataSource,
  } = stats;

  const avgHoursPerEvent =
    totalEventsCompleted > 0
      ? Math.round(totalHoursCompleted / totalEventsCompleted)
      : 0;

  const dataSourceLabel: Record<string, string> = {
    auto: "AUTO",
    manual: "MANUAL",
    api: "API",
  };

  return (
    <section className="border-t border-swiss-gray-100 bg-swiss-gray-50/40">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 py-12">
        {/* Section Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="text-label text-primary font-bold tracking-widest mb-1">
              OUR IMPACT IN NUMBERS
            </h2>
            <p className="text-sm text-swiss-gray-500">
              Cumulative impact across all NSS VIT events
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <KpiCard
            label="Total Events"
            value={totalEventsCompleted}
            // sublabel="Across all categories"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            accent="#6366f1"
            delay={0}
          />
          <KpiCard
            label="Total Hours"
            value={totalHoursCompleted}
            // sublabel={avgHoursPerEvent > 0 ? `~${avgHoursPerEvent} hrs per event on avg` : undefined}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            accent="#0891b2"
            delay={0.07}
          />
          <KpiCard
            label="Beneficiaries Reached"
            value={totalBeneficiaries || "—"}
            // sublabel="Lives touched by NSS VIT"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
            accent="#059669"
            delay={0.14}
          />
        </div>

        {/* Charts Row */}
        {categoryStats.length > 0 && (
  <div className="grid grid-cols-1 lg:grid-cols-9 gap-6 mb-10 items-stretch">
            <div className="lg:col-span-4">
              <DonutChart categoryStats={categoryStats} />
            </div>
            <div className="lg:col-span-5">
              <BarChart categoryStats={categoryStats} />
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <>
            <div className="mb-5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-swiss-gray-500">
                Breakdown by Category
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryStats.map((stat, i) => (
                <CategoryAnalyticsCard
                  key={stat.categoryId}
                  stat={stat}
                  index={i}
                  totalEvents={totalEventsCompleted}
                  totalHours={totalHoursCompleted}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {categoryStats.length === 0 && totalEventsCompleted === 0 && (
          <div className="border border-dashed border-swiss-gray-200 p-10 text-center text-swiss-gray-400">
            <svg
              className="w-10 h-10 mx-auto mb-3 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm font-medium">No event data available yet</p>
            <p className="text-xs mt-1">
              Analytics will populate as events are added and completed.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
