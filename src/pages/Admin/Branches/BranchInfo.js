// src/pages/Admin/Branches/BranchInfo.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
//import { Button, Badge } from "react-bootstrap";
import { getBranchDetail } from "../../../api/adminAPI";
import Chart from "react-apexcharts";

const BranchInfo = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchDetail = async (year = selectedYear) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBranchDetail(id, year);
      console.log("Branch data received:", data); // Để debug
      setBranch(data);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin chi tiết chi nhánh:", err);
      setError(err.message || "Lỗi khi lấy thông tin chi tiết chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    fetchDetail(year);
  };

  const handlePreviousYear = () => {
    const newYear = selectedYear - 1;
    handleYearChange(newYear);
  };

  const handleNextYear = () => {
    const newYear = selectedYear + 1;
    handleYearChange(newYear);
  };

  if (loading) return <div className="text-center p-4">Đang tải...</div>;
  if (error) return <div className="text-center p-4 text-danger">Lỗi: {error}</div>;
  if (!branch) return <div className="text-center p-4">Không tìm thấy chi nhánh</div>;

  // Safe data extraction với kiểm tra null/undefined
  const safeMonthlyRevenue = branch?.monthlyRevenue || new Array(12).fill(0);
  const safeMonths = branch?.months || ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const safeYears = branch?.availableYears || [new Date().getFullYear()];
  
  // Mapping labels tiếng Việt cho các trạng thái (khai báo trước)
  const statusLabels = {
    pending: "Chờ duyệt",
    active: "Đã duyệt",
    upcoming: "Sắp diễn ra", 
    ongoing: "Đang diễn ra",
    completed: "Đã hoàn thành",
    reject: "Bị từ chối"
  };
  
  // Chuẩn bị dữ liệu cho tour stats pie chart
  const tourStats = branch.tourStats || {};
  
  const filteredTourStats = {
    pending: tourStats.pending || 0,       // Tour đang chờ duyệt
    active: tourStats.active || 0,   // Tour đã duyệt
    upcoming: tourStats.upcoming || 0,     // Tour sắp diễn ra
    ongoing: tourStats.ongoing || 0,     // Tour đang diễn ra
    completed: tourStats.completed || 0, // Tour đã hoàn thành
    reject: tourStats.reject || 0    // Tour bị từ chối
  };
  
  // Tạo entries chỉ với các trạng thái có giá trị > 0
  const tourStatsEntries = Object.entries(filteredTourStats).filter(([_, v]) => 
    typeof v === 'number' && v > 0 && !isNaN(v)
  );
  
  const hasTourStats = tourStatsEntries.length > 0;
  const tourStatsSeries = tourStatsEntries.map(([_, v]) => v);
  const tourStatsLabels = tourStatsEntries.map(([k, _]) => statusLabels[k] || k);
  
  const tourStatsColors = ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];
  
  const commonChartOptions = {
    chart: {
      toolbar: { show: false },
      background: 'transparent'
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    grid: { show: false }
  };

  // Chuẩn bị dữ liệu cho booking stats
  const bookingStats = branch.bookingStats || {};
  // const confirmedBookings = Number(bookingStats.confirmed) || 0;
  // const canceledBookings = Number(bookingStats.canceled) || 0;
  // const totalBookings = confirmedBookings + canceledBookings;
  // const cancellationRate = totalBookings > 0 ? Math.round((canceledBookings * 100) / totalBookings) : 0;

  return (
    <div className="branch-detail-page" style={{padding: 24}}>
      {/* Header */}
      <div className="branch-header" style={{
        display: "flex", 
        alignItems: "center", 
        flexDirection: "row",
        justifyContent: "space-between",
        background: "#fff", 
        borderRadius: 12, 
        padding: "20px 32px", 
        marginBottom: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        {/* Tên chi nhánh */}
        <div style={{flex: "0 0 auto", minWidth: 180}}>
          <div style={{
            fontSize: 48, 
            fontWeight: 700, 
            color: "#2c3e50",
            lineHeight: 1,
            letterSpacing: "-1px"
          }}>
            {branch.branch_name || 'N/A'}
          </div>
        </div>

        {/* Thông tin chi nhánh */}
        <div style={{
          flex: "1 1 0", 
          display: "flex", 
          flexDirection: "row", 
          alignItems: "center",
          gap: 48,
          marginLeft: 48,
          marginRight: 32
        }}>
          <div>
            <span style={{color: "#7f8c8d", fontSize: 14, fontWeight: 500}}>Mã chi nhánh</span>
            <div style={{fontSize: 16, fontWeight: 600, color: "#2c3e50"}}>
              {branch.branch_code || `#${branch.branch_id}`}
            </div>
          </div>
          <div>
            <span style={{color: "#7f8c8d", fontSize: 14, fontWeight: 500}}>Số điện thoại</span>
            <div style={{fontSize: 16, fontWeight: 600, color: "#2c3e50"}}>
              {branch.phone || '01111111111'}
            </div>
          </div>
          <div>
            <span style={{color: "#7f8c8d", fontSize: 14, fontWeight: 500}}>Địa chỉ chi nhánh</span>
            <div style={{fontSize: 16, fontWeight: 600, color: "#2c3e50", maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {branch.address || 'Chưa cập nhật địa chỉ'}
            </div>
          </div>
        </div>

        {/* Trạng thái và button */}
        <div style={{
          flex: "0 0 auto", 
          display: "flex", 
          flexDirection: "row", 
          alignItems: "center", 
          gap: 16
        }}>
          {/* Ẩn badge trạng thái vì bảng Branch không có cột status */}
          {/* <Badge 
            bg={branch.status === "active" ? "success" : "secondary"}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 20,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            {branch.status === "active" ? "HOẠT ĐỘNG" : "KHÔNG HOẠT ĐỘNG"}
          </Badge> */}
        </div>
      </div>

      {/* Charts & Stats */}
      <div className="row" style={{marginBottom: 24}}>
        <div className="col-md-8">
          <div style={{background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24}}>
            <div style={{fontWeight: 600, marginBottom: 8}}>Thống kê doanh thu theo tháng - Năm {selectedYear}</div>
            <Chart
              type="bar"
              height={250}
              series={[{ 
                name: "Doanh thu (VND)", 
                data: safeMonthlyRevenue 
              }]}
              options={{
                ...commonChartOptions,
                xaxis: { 
                  categories: safeMonths,
                  labels: {
                    style: {
                      fontSize: '12px'
                    }
                  }
                },
                yaxis: {
                  labels: {
                    formatter: function (value) {
                      return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
                    }
                  }
                },
                colors: ['#1976d2'],
                plotOptions: {
                  bar: {
                    borderRadius: 4
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div style={{background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24}}>
            <div style={{fontWeight: 600, marginBottom: 16, color: "#666"}}>Lịch theo năm</div>
            
            {/* Year Navigator */}
            <div style={{
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              marginBottom: 20,
              padding: "12px 0"
            }}>
              <button
                onClick={handlePreviousYear}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  color: "#007bff",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "50%",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                ←
              </button>
              
              <div style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#333"
              }}>
                {selectedYear}
              </div>
              
              <button
                onClick={handleNextYear}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  color: "#007bff",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "50%",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                →
              </button>
            </div>

            {/* Available Years */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              marginBottom: 16
            }}>
              {safeYears.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  style={{
                    padding: "8px 12px",
                    fontSize: 14,
                    fontWeight: 500,
                    border: "1px solid #e0e0e0",
                    borderRadius: 6,
                    background: year === selectedYear ? "#007bff" : "#fff",
                    color: year === selectedYear ? "#fff" : "#333",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    minHeight: 36
                  }}
                  onMouseEnter={(e) => {
                    if (year !== selectedYear) {
                      e.target.style.backgroundColor = "#f8f9fa";
                      e.target.style.borderColor = "#007bff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (year !== selectedYear) {
                      e.target.style.backgroundColor = "#fff";
                      e.target.style.borderColor = "#e0e0e0";
                    }
                  }}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Current Year Highlight */}
            <div style={{
              background: "#e3f2fd",
              border: "1px solid #2196f3",
              borderRadius: 8,
              padding: 16,
              textAlign: "center"
            }}>
              <div style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1976d2",
                marginBottom: 4
              }}>
                {selectedYear}
              </div>
              <div style={{
                fontSize: 12,
                color: "#666"
              }}>
                Năm đang chọn
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie & Doughnut */}
      <div className="row">
        {/* <div className="col-md-4">
          <div style={{background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24}}>
            <div style={{fontWeight: 600, marginBottom: 8}}>Tỷ lệ đặt tour/hủy tour</div>
            {totalBookings > 0 ? (
              <>
                <Chart
                  type="donut"
                  height={200}
                  series={[confirmedBookings, canceledBookings]}
                  options={{
                    ...commonChartOptions,
                    labels: ["Đã đặt", "Đã hủy"],
                    colors: ["#00bcd4", "#ff5252"],
                    dataLabels: {
                      enabled: true,
                      formatter: function (val, opts) {
                        return Math.round(val) + '%';
                      }
                    }
                  }}
                />
                <div style={{textAlign: "center", fontWeight: 700, fontSize: 24, marginTop: 8}}>
                  Tỷ lệ hủy: {cancellationRate}%
                </div>
              </>
            ) : (
              <div style={{textAlign: "center", padding: 40, color: "#999"}}>
                Không có dữ liệu booking
              </div>
            )}
          </div>
        </div> */}
        <div className="col-md-8">
          <div style={{background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24}}>
            <div style={{fontWeight: 600, marginBottom: 8}}>Phân loại tour theo trạng thái</div>
            {hasTourStats ? (
              <>
                <Chart
                  type="donut"
                  height={200}
                  series={tourStatsSeries}
                  options={{
                    ...commonChartOptions,
                    labels: tourStatsLabels,
                    colors: tourStatsColors.slice(0, tourStatsLabels.length),
                    dataLabels: {
                      enabled: true,
                      formatter: function (val, opts) {
                        const seriesIndex = opts.seriesIndex;
                        return tourStatsSeries[seriesIndex];
                      }
                    }
                  }}
                />
                <div style={{marginTop: 16}}>
                  {tourStatsEntries.map(([key, value], idx) => (
                    <div key={key} style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 4}}>
                      <div style={{
                        width: 12,
                        height: 12,
                        background: tourStatsColors[idx % tourStatsColors.length],
                        borderRadius: "50%"
                      }}></div>
                      <div style={{textTransform: 'capitalize'}}>{statusLabels[key] || key}: <strong>{value}</strong> tour</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{textAlign: "center", padding: 40, color: "#999"}}>
                Không có dữ liệu tour
              </div>
            )}
            <div style={{marginTop: 16}}>
              {/* <a href="#" style={{color: "#1976d2", textDecoration: "none"}}>
                Xem tất cả tour của chi nhánh →
              </a> */}
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="row">
        <div className="col-md-12">
          <div style={{background: "#fff", borderRadius: 12, padding: 24}}>
            <div style={{fontWeight: 600, marginBottom: 16}}>Thống kê tổng quan</div>
            <div className="row">
              <div className="col-md-3">
                <div style={{textAlign: "center", padding: 16, border: "1px solid #e0e0e0", borderRadius: 8}}>
                  <div style={{fontSize: 24, fontWeight: 700, color: "#1976d2"}}>
                    {bookingStats.totalRevenue ? new Intl.NumberFormat('vi-VN').format(bookingStats.totalRevenue) : '0'}
                  </div>
                  <div style={{color: "#666"}}>Tổng doanh thu (VND)</div>
                </div>
              </div>
              <div className="col-md-3">
                <div style={{textAlign: "center", padding: 16, border: "1px solid #e0e0e0", borderRadius: 8}}>
                  <div style={{fontSize: 24, fontWeight: 700, color: "#00e676"}}>
                    {Object.values(filteredTourStats).reduce((sum, count) => sum + count, 0)}
                  </div>
                  <div style={{color: "#666"}}>Tổng số tour</div>
                </div>
              </div>
              <div className="col-md-3">
                <div style={{textAlign: "center", padding: 16, border: "1px solid #e0e0e0", borderRadius: 8}}>
                  <div style={{fontSize: 24, fontWeight: 700, color: "#ffb300"}}>
                    {bookingStats.total || 0}
                  </div>
                  <div style={{color: "#666"}}>Tổng booking</div>
                </div>
              </div>
              <div className="col-md-3">
                <div style={{textAlign: "center", padding: 16, border: "1px solid #e0e0e0", borderRadius: 8}}>
                  <div style={{fontSize: 24, fontWeight: 700, color: "#ff5252"}}>
                    {branch.employeeStats?.total || 0}
                  </div>
                  <div style={{color: "#666"}}>Tổng nhân viên</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchInfo;