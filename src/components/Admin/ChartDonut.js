import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import './Styles/ChartDonut.scss';

/**
 * Props:
 * - completed: number   // số tour đã khởi hành
 * - pending: number     // số tour chưa khởi hành
 */
const ChartDonut = ({ completed, pending }) => {
  const pieData = [
    { name: 'Đã khởi hành', value: completed },
    { name: 'Chưa khởi hành', value: pending }
  ];

  const COLORS = ['#2BC289', '#FF4D4F'];
  const total = completed + pending;

  return (
    <div className="chart-donut">
      <div className="chart-donut__header">
        Tour đã hoàn thành / chưa khởi hành
      </div>

      <div className="chart-donut__body">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={90}
              outerRadius={120}
              startAngle={90}
              endAngle={-270}
              paddingAngle={4}
              cornerRadius={60}
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="chart-donut__center">
          <div className="chart-donut__center-count">{total}</div>
          <div className="chart-donut__center-label">Tour</div>
        </div>
      </div>

      <div className="chart-donut__legend">
        <div className="chart-donut__legend-item">
          <span className="chart-donut__legend-item-dot chart-donut__legend-item-completed" /> Đã khởi hành
        </div>
        <div className="chart-donut__legend-item">
          <span className="chart-donut__legend-item-dot chart-donut__legend-item-pending" /> Chưa khởi hành
        </div>
      </div>
    </div>
  );
};

export default ChartDonut;
