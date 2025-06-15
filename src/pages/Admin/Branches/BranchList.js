// src/pages/Admin/BranchList.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDataTable from '../../../components/Admin/adminDataTable';
import { getBranchStats, addBranch } from '../../../api/adminAPI'; // bạn cần export hàm này từ adminAPI
import { Modal, Button, Form } from 'react-bootstrap';

const BranchManagement = () => {
  const [branches, setBranches]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  //const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const itemsPerPage              = 10;
  const navigate                  = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ branch_name: '', phone: '', address: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const data = await getBranchStats();
        setBranches(data);
      } catch (err) {
        console.error('Lỗi khi lấy thống kê chi nhánh:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const pagedData = branches.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const columns = [
    { header: 'Tên chi nhánh', accessor: 'branch_name' },
    { 
      header: 'Doanh thu', 
      accessor: 'revenue',
      render: row => `${row.revenue.toLocaleString('vi-VN')} VND`
    },
    { 
      header: 'Trạng thái', 
      accessor: 'status',
      render: row => {
        const isActive = row.status === 'active';
        return (
          <span 
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: isActive ? '#d4edda' : '#f8d7da',
              color: isActive ? '#155724' : '#721c24',
              border: `1px solid ${isActive ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
          </span>
        );
      }
    },
    { 
      header: 'SL tour', 
      accessor: 'total_tours' 
    },
    // { 
    //   header: 'Tỷ lệ huỷ', 
    //   accessor: 'cancellation_rate',
    //   render: row => `${row.cancellation_rate}%`
    // },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: row => (
        <button
          className="btn btn-sm btn-info"
          onClick={() => navigate(`/admin/branchManagement/${row.branch_id}`)}
        >
          Xem chi tiết
        </button>
      )
    }
  ];

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => { setShowModal(false); setForm({ branch_name: '', phone: '', address: '' }); };
  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleAddBranch = async () => {
    setAdding(true);
    try {
      await addBranch(form); // sẽ tạo hàm này ở api
      setShowModal(false);
      setForm({ branch_name: '', phone: '', address: '' });
      // reload lại danh sách
      const data = await getBranchStats();
      setBranches(data);
    } catch (err) {
      // alert('Lỗi khi thêm chi nhánh mới!');
      alert('Lỗi khi thêm chi nhánh mới!\n' + (err?.response?.data?.error || err.message));  
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
           {/* <h2>Quản lý chi nhánh</h2> */}
        <Button variant="success" onClick={handleShowModal}>Thêm mới +</Button>
      </div>
      <AdminDataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        totalItems={branches.length}
        currentPage={page}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: setSelectedRowKeys        
        // }}
      />
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tạo chi nhánh mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên chi nhánh</Form.Label>
              <Form.Control name="branch_name" value={form.branch_name} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại chi nhánh</Form.Label>
              <Form.Control name="phone" value={form.phone} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ chi nhánh</Form.Label>
              <Form.Control name="address" value={form.address} onChange={handleFormChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Huỷ</Button>
          <Button variant="success" onClick={handleAddBranch} disabled={adding}>
            {adding ? 'Đang thêm...' : 'Xác nhận'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BranchManagement;
