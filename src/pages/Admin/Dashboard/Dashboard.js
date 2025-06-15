// src/pages/Admin/Dashboard.js
import React, { useEffect, useState } from "react";
import { DollarSign, Users, MapPin } from 'lucide-react';
import {
  getOverviewStats,
  getBranchStats,
  getChartData,
  getTransactions
} from "../../../api/adminAPI";
import StatCard from "../../../components/Admin/StatCard";
import BranchTable from "../../../components/Admin/BranchTable";
import ChartDonut from "../../../components/Admin/ChartDonut";
import TransactionsTable from "../../../components/Admin/TransacTable";

const Dashboard = () => {
  // Bắt đầu ở trạng thái loading để tránh đọc giá trị undefined
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalTours: 0
  });
  const [branches, setBranches] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const ov = await getOverviewStats();
        const br = await getBranchStats();
        const ch = await getChartData();
        const tx = await getTransactions();

        setOverview(ov);
        const top5 = br
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
        setBranches(top5)
        setChartData(ch);
        setTransactions(tx);
      } catch (err) {
        console.error("Lỗi load dashboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (error)   return <p className="text-danger">{error}</p>;

  return (
    <div className="dashboard">
      {/* <p className="text-muted ">Thống kê</p> */}
      <div className="row stats-cards mb-4">
        <StatCard
          variant="primary"
          icon={<DollarSign />}
          title="Doanh thu"
          value={overview.totalRevenue.toLocaleString()}
          suffix=" VND"
        />
        <StatCard
          variant="secondary"
          icon={<Users />}
          title="Khách hàng"
          value={overview.totalCustomers}
        />
        <StatCard
          variant="tertiary"
          icon={<MapPin />}
          title="Số Tour"
          value={overview.totalTours}
        />
      </div>

      <div className="stats-chart-container row gx-4 ">
        <div className="col-lg-6 col-12 " style={{ flex: 1 }}>
          <BranchTable data={branches} />
        </div>
        <div className=" col-lg-6 col-12 " style={{ flex: 1 }}>
          <ChartDonut completed={chartData.completed || 0} pending={chartData.pending || 0} />
        </div>
      </div>
      <TransactionsTable data={transactions} />
    </div>
  );
};

export default Dashboard;