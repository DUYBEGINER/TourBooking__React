// src/pages/Admin/StaffManagement.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDataTable from '../../../components/Admin/adminDataTable';
import { getEmployees, lockEmployees, unlockEmployee } from '../../../api/adminAPI';
import { Modal, Button } from 'react-bootstrap';
import { AuthContext } from '../../../context/AuthContext';

const roleMap = {
  1: 'Quản lý',
  2: 'Nhân viên kinh doanh',
  3: 'Nhân viên tư vấn',
};

const StaffManagement = () => {
  const { user } = useContext(AuthContext); // Lấy user hiện tại
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [tempRole, setTempRole] = useState(roleFilter);
  const [tempBranch, setTempBranch] = useState(branchFilter);
  const [tempStatus, setTempStatus] = useState(statusFilter);
  const navigate = useNavigate();

  // 1. Lấy dữ liệu từ server
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const { employees, total } = await getEmployees('active', page, 10);
        setEmployees(employees);
        setTotal(total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [page]);

  // 2. Tính danh sách filter options (role_id có trong data)
  const roleOptions = React.useMemo(() => {
    return Array.from(new Set(employees.map(e => e.role_id)));
  }, [employees]);

  const branchOptions = React.useMemo(() => {
    return Array.from(new Set(employees.map(e => e.branch_name)));
  },   [employees]);
  // 3. Áp dụng filter & tìm kiếm trên client
  useEffect(() => {
    let data = employees;
    if (roleFilter) {
      data = data.filter(e => e.role_id === Number(roleFilter));
    }
    if (branchFilter) {
      data = data.filter(e => e.branch_name === branchFilter);
    }
    if (statusFilter) {
      data = data.filter(e => e.em_status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      data = data.filter(
        e =>
          e.emp_id.toLowerCase().includes(term) ||
          e.fullname.toLowerCase().includes(term)
      );
    }
    // Loại bỏ tài khoản đang đăng nhập khỏi danh sách
    if (user && user.emp_id) {
      data = data.filter(e => e.emp_id !== user.emp_id);
    }
    setFiltered(data);
  }, [employees, searchTerm, roleFilter, branchFilter, statusFilter, user]);

  // Khóa các nhân viên đã chọn
  const handleLockSelected = async () => {
    try {
      await lockEmployees(selectedRowKeys);        // gọi API bulk-lock
      setSelectedRowKeys([]);                      // reset selection
      setPage(1);                                  // quay về trang 1 (tuỳ chọn)
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi khóa nhân viên');
    }
  };
  
  const handleUnlockSelected = async () => {
    try {
      await unlockEmployee(selectedRowKeys);
      setSelectedRowKeys([]);
      setPage(1);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi mở khoá nhân viên');
    }
  };

  const handleLockSingle = async (id) => {
    try {
      await lockEmployees([id]);
      setEmployees(prev =>
        prev.map(emp =>
          emp.emp_id === id ? { ...emp, em_status: 'inactive' } : emp
        )
      );
    } catch (err) {
      alert('Có lỗi khi khoá nhân viên');
    }
  };
  
  const handleUnlockSingle = async (id) => {
    try {
      await unlockEmployee([id]);
      setEmployees(prev =>  // cập nhật trạng thái nhân viên
        prev.map(emp =>
          emp.emp_id === id ? { ...emp, em_status: 'active' } : emp
        )
      );
    } catch (err) {
      alert('Có lỗi khi mở khoá nhân viên');
    }
  };

  // 4. Column định nghĩa cho AdminDataTable
  const columns = [
    
    { header: 'ID nhân viên',   accessor: 'emp_id'    },
    { header: 'Tên nhân viên',  accessor: 'fullname'  },
    { header: 'Quyền hạn',        accessor: 'role_id',    render: row => roleMap[row.role_id] || '—'   },
    { header: 'Chi nhánh',      accessor: 'branch_name' },
    { header: 'Trạng thái',     accessor: 'em_status' },
    {
      header: '',
      accessor: 'actions',
      render: row => (
        <div>
          <button 
            className="btn btn-sm btn-primary me-2" 
            onClick={() => navigate(`./${row.emp_id}`)}>Sửa</button>
          {row.em_status === 'active' ? (
            <button 
              className="btn btn-sm btn-danger" 
              onClick={() => handleLockSingle(row.emp_id)}>Khoá</button>
          ) : (
            <button 
              className="btn btn-sm btn-success" 
              onClick={() => handleUnlockSingle(row.emp_id)}>Mở khoá</button>
          )}
        </div>
      )
    },
  ];

  return (
    <div>
      {/* <h2>Quản lý nhân viên</h2> */}
      
      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Tìm theo ID hoặc tên..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => {
          setTempRole(roleFilter);
          setTempBranch(branchFilter);
          setTempStatus(statusFilter);
          setShowFilter(true);
        }}>Bộ Lọc</Button>
        {/* Nút hành động chọn */}
        {selectedRowKeys.length > 0 && (
          <>
            <button
              onClick={handleLockSelected}
              className="btn btn-danger me-2"
            >
              Khóa đã chọn ({selectedRowKeys.length})
            </button>
            <button
              onClick={handleUnlockSelected}
              className="btn btn-success me-2"
            >
              Mở khoá đã chọn ({selectedRowKeys.length})
            </button>
            <button
              onClick={() => setSelectedRowKeys([])}
              className="btn btn-outline-secondary"
            >Bỏ chọn</button>
          </>
        )}
        <button className="btn btn-success me-2"
          onClick={() => navigate('addNewEmployee')}>
          Thêm nhân viên
        </button>
      </div>
      {/* Modal filter */}
      <Modal show={showFilter} onHide={() => setShowFilter(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bộ lọc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label>Quyền nhân viên</label>
            <select className="form-select" value={tempRole} onChange={e => setTempRole(e.target.value)}>
              <option value="">Tất cả</option>
              {roleOptions.map(rid => (
                <option key={rid} value={rid}>{roleMap[rid]}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Chi nhánh</label>
            <select className="form-select" value={tempBranch} onChange={e => setTempBranch(e.target.value)}>
              <option value="">Tất cả</option>
              {branchOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Trạng thái</label>
            <select className="form-select" value={tempStatus} onChange={e => setTempStatus(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Khoá</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilter(false)}>Đóng</Button>
          <Button variant="danger" onClick={() => {
            setRoleFilter(tempRole);
            setBranchFilter(tempBranch);
            setStatusFilter(tempStatus);
            setShowFilter(false);
          }}>Xem kết quả</Button>
        </Modal.Footer>
      </Modal>

      {/* Bảng dữ liệu */}
      <AdminDataTable
        columns={columns}
        data={filtered}
        loading={loading}
        totalItems={total}
        currentPage={page}
        itemsPerPage={10}
        onPageChange={setPage}
        // Truyền rowSelection vào
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys        
        }}
      />
    </div>
  );
};

export default StaffManagement;
