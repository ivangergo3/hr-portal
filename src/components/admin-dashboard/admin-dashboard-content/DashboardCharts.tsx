'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export interface ProjectChartData {
  id: string;
  name: string;
  color: string;
  hours: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
        <p className="font-medium text-sm">{payload[0].name}</p>
        <p className="text-sm text-slate-600">
          <span className="font-medium">{payload[0].value}</span> hours
        </p>
      </div>
    );
  }
  return null;
};

export function ProjectBarChart({ data }: { data: ProjectChartData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={false} // Hide the tick labels
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis
            label={{
              value: 'Hours',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12, fill: '#666' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectPieChart({ data }: { data: ProjectChartData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="hours"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name.split(' - ')[0]} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {/* Legend removed to save space */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardCharts({
  projectData,
}: {
  projectData: ProjectChartData[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Hours by Project
        </h2>
        <ProjectBarChart data={projectData} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Work Distribution
        </h2>
        <ProjectPieChart data={projectData} />
      </div>
    </div>
  );
}
