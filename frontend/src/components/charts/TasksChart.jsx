import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = {
  pending: "#f59e0b",
  inProgress: "#3b82f6",
  completed: "#10b981",
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  if (percent === 0) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      className="text-sm font-medium dark:fill-gray-200 fill-gray-700"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const TasksChart = ({ stats }) => {
  if (!stats) return null;

  const statusData = [
    { name: "Pendiente", value: stats.pending, color: COLORS.pending },
    { name: "En Progreso", value: stats.inProgress, color: COLORS.inProgress },
    { name: "Completada", value: stats.completed, color: COLORS.completed },
  ].filter((item) => item.value > 0);

  const priorityData = [
    { name: "Baja", value: stats.lowPriority, color: COLORS.low },
    { name: "Media", value: stats.mediumPriority, color: COLORS.medium },
    { name: "Alta", value: stats.highPriority, color: COLORS.high },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Tareas por Estado
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="dark:stroke-gray-700"
            />
            <XAxis dataKey="name" className="dark:fill-gray-300" />
            <YAxis className="dark:fill-gray-300" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#f3f4f6",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              itemStyle={{ color: "#f3f4f6" }}
              labelStyle={{ color: "#f3f4f6" }}
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Bar dataKey="value" fill="#3b82f6">
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Tareas por Prioridad
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#f3f4f6",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              itemStyle={{ color: "#f3f4f6" }}
              labelStyle={{ color: "#f3f4f6" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
