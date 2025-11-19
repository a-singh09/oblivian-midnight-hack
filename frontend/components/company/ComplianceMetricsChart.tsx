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

      // Generate realistic data with good visibility
      const baseRequests = 15;
      const requestVariation = Math.floor(Math.random() * 10);
      const requests = baseRequests + requestVariation;
      const completed = Math.max(
        requests - Math.floor(Math.random() * 3),
        Math.floor(requests * 0.9),
      );

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: dateRange === "1y" ? undefined : "numeric",
        }),
        requests,
        completed,
        avgResponseTime: Math.floor(Math.random() * 8) + 6, // 6-14 hours
        proofGenTime: Math.floor(Math.random() * 4) + 10, // 10-14 seconds
      });
    }

    return data;
  };

  const data = generateData();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Deletion Requests Over Time */}
      <div className="p-6 rounded-lg bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Deletion Requests
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend
              wrapperStyle={{
                color: "#fff",
                paddingTop: "20px",
              }}
            />
            <Bar
              dataKey="requests"
              fill="#22d3ee"
              name="Total Requests"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="completed"
              fill="#34d399"
              name="Completed"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Response Time Trend */}
      <div className="p-6 rounded-lg bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Response Time (hours)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend
              wrapperStyle={{
                color: "#fff",
                paddingTop: "20px",
              }}
            />
            <Line
              type="monotone"
              dataKey="avgResponseTime"
              stroke="#22d3ee"
              strokeWidth={3}
              name="Avg Response Time"
              dot={{ fill: "#22d3ee", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="text-xs text-muted-foreground mb-1">
            GDPR Requirement
          </div>
          <div className="text-sm text-foreground font-medium">
            Must respond within 30 days (720 hours)
          </div>
        </div>
      </div>

      {/* Proof Generation Time */}
      <div className="p-6 rounded-lg bg-card border border-border md:col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Proof Generation Time (seconds)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend
              wrapperStyle={{
                color: "#fff",
                paddingTop: "20px",
              }}
            />
            <Line
              type="monotone"
              dataKey="proofGenTime"
              stroke="#a78bfa"
              strokeWidth={3}
              name="ZK Proof Generation"
              dot={{ fill: "#a78bfa", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
