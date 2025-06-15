import React from 'react';
import { Row, Col } from 'react-bootstrap';
import InputFiledIcon from '../../../../components/Common/InputFieldIcon/InputFieldIcon';
import InputFieldIcon2 from '../../../../components/Common/InputFieldIcon/InputFieldIcon2';
import DropDownIconBtn from '../../../../components/Common/DropDownIcon/DropDownIconBtn';
import DatePicker from '../../../../components/Common/DatePicker/DatePicker';
import CouterInput from '../../../../components/Common/Button/CounterInput/CouterInput';
import { FaLocationDot, FaClock, FaCar } from "react-icons/fa6";
import { provinceList } from '../../../../utils/provinceList';

const TourBasicInfo = ({ values, onChange }) => {
  return (
    <>
      <Row className="mb-3">
        <Col md={4}>
          <DropDownIconBtn
            optionList={provinceList}
            label="Điểm xuất phát"
            value={values.departureLocation}
            onChange={onChange}
            name="departureLocation"
            icon={FaLocationDot}
            required={true}
          />
        </Col>
        <Col md={4}>
          <DropDownIconBtn
            optionList={provinceList}
            label="Điểm đến"
            value={values.destination}
            onChange={onChange}
            name="destination"
            icon={FaLocationDot}
            required={true}
          />
        </Col>
        <Col md={4}>
          <InputFieldIcon2
            label="Thời gian"
            value={`${values.duration} ngày ${(values.duration === 0) ? '' : `${values.duration-1} đêm`}`}
            icon={FaClock}
            onChange={onChange}
            name="duration"
            readOnly={true}
            required={true}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <DatePicker
            label="Ngày khởi hành"
            value={values.start_date}
            name="start_date"
            onChange={onChange}
            required={true} 
          />
        </Col>
        <Col md={3}>
          <DatePicker
            label="Ngày trở về"
            value={values.end_date}
            name="end_date"
            onChange={onChange}
            required={true}
          />
        </Col>
        <Col md={2}>
          <CouterInput
            label="Số lượng chỗ"
            value={values.max_guests}
            onChange={onChange}
            name="max_guests"
          />
        </Col>
        <Col md={4}>
          <InputFieldIcon2
            label="Phương tiện"
            value={values.transport}
            icon={FaCar}
            placeholder="Nhập phương tiện"
            onChange={onChange}
            name="transport"
            required={true}
          />
        </Col>
      </Row>
    </>
  );
};

export default TourBasicInfo; 