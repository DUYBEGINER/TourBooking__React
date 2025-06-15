import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaTag, FaTimes } from 'react-icons/fa';
import { checkPromotionCode } from '../../../api/promotionAPI';
import './PromotionModal.scss';

const PromotionModal = ({ show, onHide, onApplyPromotion, originalTotal }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  const handleApplyPromotion = async () => {
    if (!promoCode.trim()) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsApplying(true);
    setError('');

    try {
      // Kiểm tra mã giảm giá
      const response = await checkPromotionCode(promoCode.trim());
      if (response.success) {
        // Nếu hợp lệ, áp dụng ngay
        onApplyPromotion(response.data);
        onHide();
        // Reset state
        setPromoCode('');
        setError('');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClose = () => {
    setPromoCode('');
    setError('');
    onHide();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyPromotion();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="promotion-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaTag className="me-2" />
          Thêm mã giảm giá
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Mã giảm giá</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập mã giảm giá của bạn"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isApplying}
              autoFocus
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <FaTimes className="me-2" />
              {error}
            </Alert>
          )}

          <div className="promo-info-text">
            <small className="text-muted">
              Nhập mã giảm giá và bấm "Áp dụng" để kiểm tra và sử dụng ngay.
            </small>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isApplying}>
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={handleApplyPromotion}
          disabled={!promoCode.trim() || isApplying}
        >
          {isApplying ? (
            <>
              <Spinner size="sm" className="me-2" />
              Đang áp dụng...
            </>
          ) : (
            'Áp dụng mã giảm giá'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PromotionModal; 