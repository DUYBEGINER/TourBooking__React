// src/components/Admin/BranchTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Styles/BranchTable.scss";

/**
 * Props:
 * - data: Array<{
 *     branch_id: number;
 *     branch_name: string;
 *     revenue: number;
 *     growth_percentage: number;
 *     cancel_rate: number;
 *     total_tours: number;
 *   }>
 */
const BranchTable = ({ data }) => {
  const navigate = useNavigate();
  return (
    <div className="branch-table">
      <div className="branch-table__header">
        <div className="branch-table__title">Thống kê theo chi nhánh</div>
        <button 
          className="branch-table__view-all"
          onClick={() => navigate('/admin/branchManagement')}
        >
          Xem tất cả
        </button>
      </div>

      <div className="branch-table__body">
        <table className="branch-table__table">
          <thead>
            <tr>
              <th>Chi nhánh</th>
              <th>Doanh thu</th>
              <th>Tăng trưởng</th>
              {/* <th>Tỷ lệ huỷ</th> */}
              <th>Sl tour</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ branch_id, branch_name, revenue, growth_percentage, cancel_rate, total_tours }) => (
              <tr key={branch_id}>
                <td>{branch_name}</td>
                <td>{typeof revenue === 'number' 
                    ? revenue.toLocaleString('vi-VN') 
                    : '0'} VND
                </td>
                <td className={
                  growth_percentage >= 0 
                    ? 'branch-table__growth-positive' 
                    : 'branch-table__growth-negative'
                }>
                  {growth_percentage}%
                </td>
                  {/* <td className="branch-table__cancel-rate">
                    {cancel_rate}%
                  </td> */}
                <td>{total_tours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchTable;
