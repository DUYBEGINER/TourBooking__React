// ConfirmDialog.js (cập nhật để tái sử dụng)
import React from 'react';
import './ConfirmDialog.scss';

const ConfirmDialog = ({ message, checkConfirm }) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <p className="dialog-message"> {message}</p>
        <div className="dialog-actions flex justify-content-between g-5">
          <button className="confirm-btn" onClick={() => checkConfirm(true)}>Xác nhận</button>
          <button className="cancel-btn" onClick={() => checkConfirm(false)}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;