import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import InputFieldIcon from '../../../components/Common/InputFieldIcon/InputFieldIcon';
import DatePicker from '../../../components/Common/DatePicker/DatePicker';
import CouterInput from '../../../components/Common/Button/CounterInput/CouterInput';

function PromotionBasicInfor({values, onChange}) {

    return (
        <>
      <Row className="mb-3">
        <Col md={4}>
            <InputFieldIcon
                label="Tên khuyến mãi"
                value={values.promo_name}
                placeholder="Nhập tên khuyến mãi"
                onChange={onChange}
                name="promo_name"
                required={true}
              />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
            <InputFieldIcon
                label="Mã khuyến mãi"
                value={values.code}
                placeholder="Nhập mã khuyến mãi"
                onChange={onChange}
                name="code"
                required={true}
              />
        </Col>
        <Col md={{span: 2, offset: 1}}>
            <CouterInput
                label="Mức giảm giá (%)"
                value={values.discount_percentage}
                onChange={onChange}
                name="discount_percentage"
            />
        </Col>
      </Row>
      <Row>
          <Col md={2}>
          <DatePicker
              label="Ngày bắt đầu"
              value={values.start_date}
              name="start_date"
              onChange={onChange}
              required={true}
            />
          </Col>
          <Col md={2}>
            <DatePicker
                label="Ngày kết thúc"
                value={values.end_date}
                name="end_date"
                onChange={onChange}
                required={true}
              />
          </Col>
          <Col md={2}>
             <CouterInput
                label="Số lượng tối đa"
                value={values.max_use}
                onChange={onChange}
                name="max_use"
              />
          </Col>
      </Row>
      <Row>

      </Row>
    </>
    );
}

export default PromotionBasicInfor;