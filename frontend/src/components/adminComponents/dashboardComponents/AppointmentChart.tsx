import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export interface IAppointmentData {
  _id: string; // For weekly, this is a weekday abbreviation (e.g., "Sun")
  completed: number;
  canceled: number;
}

interface AppointmentChartProps {
  timeFrame: string;
  data: IAppointmentData[];
}

const formatXAxisLabel = (timeFrame: string, label: string): string => {
  switch (timeFrame) {
    case "daily": {
      const date = new Date(label);
      return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
    }
    case "weekly": {
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      if (weekdays.includes(label)) return label;
      const date = new Date(label);
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
    case "monthly": {
      const parts = label.split("-");
      if (parts[1]) {
        const date = new Date(`${parts[0]}-${parts[1]}-01`);
        return date.toLocaleDateString("en-US", { month: "short" });
      }
      return label;
    }
    case "yearly": {
      return label;
    }
    default:
      return label;
  }
};

const renderXAxisTick = (props: any) => {
  const { x, y, payload, timeFrame } = props;
  const formattedLabel = formatXAxisLabel(timeFrame, payload.value);
  return (
    <text x={x} y={y + 15} textAnchor="middle" fill="#6b7280" fontSize={12}>
      {formattedLabel}
    </text>
  );
};

const AppointmentChart: React.FC<AppointmentChartProps> = ({ timeFrame, data }) => {
  if (timeFrame === "yearly" || timeFrame === "monthly") {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCanceled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="_id"
              tick={(props) => renderXAxisTick({ ...props, timeFrame })}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickCount={5} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} formatter={(value) => <span className="text-sm text-gray-600">{value}</span>} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCompleted)"
              activeDot={{ r: 6 }}
              name="Completed"
            />
            <Area
              type="monotone"
              dataKey="canceled"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCanceled)"
              activeDot={{ r: 6 }}
              name="Canceled"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={10}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="_id"
            tick={(props) => renderXAxisTick({ ...props, timeFrame })}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickCount={5} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} formatter={(value) => <span className="text-sm text-gray-600">{value}</span>} />
          <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} name="Completed" animationDuration={1500} />
          <Bar dataKey="canceled" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} name="Canceled" animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentChart;
