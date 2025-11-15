"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ComplianceMetricsChartProps {
  dateRange: "7d" | "30d" | "90d" | "1y";
}

export function ComplianceMetricsChart({
  dateRange,
}: ComplianceMetricsChartProps) {
  // Mock data based on date range
  const generateData = () => {
    const dataPoints =
      dateRange === "7d"
        ? 7
        : dateRange === "30d"
          ? 30
          : dateRange === "90d"
            ? 12
            : 12;
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      if (dateRange === "7d") {
        date.setDate(date.getDate() - (6 - i));
      } else if (dateRange === "30d") {
        date.setDate(date.getDate() - (29 - i));
      } else if (dateRange === "90d") {
        date.setDate(date.getDate() - (11 - i) * 7);
      } else {
        date.setMonth(date.getMonth() - (11 - i));
      }

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: dateRange === "1y" ? undefined : "numeric",
        }),
        requests: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 18) + 5,
        avgResponseTime: Math.floor(Math.random() * 10) + 5,
        proofGenTime: Math.floor(Math.random() * 5) + 10,
      });
    }

    return data;
  };

  const data = generateData();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Deletion Requests Over Time */}
      <div className="p-6 rounded-lg bg-secondary/30 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Deletion Requests
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
            <Bar
              dataKey="requests"
              fill="hsl(var(--primary))"
              name="Total Requests"
            />
            <Bar
              dataKey="completed"
              fill="hsl(var(--accent))"
              name="Completed"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Response Time Trend */}
      <div className="p-6 rounded-lg bg-secondary/30 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Response Time (hours)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
            <Line
              type="monotone"
              dataKey="avgResponseTime"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Avg Response Time"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">
            GDPR Requirement
          </div>
          <div className="text-sm text-foreground">
            Must respond within 30 days (720 hours)
          </div>
        </div>
      </div>

      {/* Proof Generation Time */}
      <div className="p-6 rounded-lg bg-secondary/30 border border-border md:col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Proof Generation Time (seconds)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
            <Line
              type="monotone"
              dataKey="proofGenTime"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              name="ZK Proof Generation"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
