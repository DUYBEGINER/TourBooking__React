import React, { useContext, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import InputFiledIcon from '../../../components/Common/InputFieldIcon/InputFieldIcon';
import { v4 as uuidv4 } from 'uuid';

import "./AddNewTour.scss"
import { useNavigate, useLocation } from 'react-router-dom';
import { TourContext } from '../../../context/TourContext';
import { AuthContext } from '../../../context/AuthContext';

// Import components
import TourBasicInfo from './components/TourBasicInfo';
import TourImageUploader from './components/TourImageUploader';
import TourScheduleManager from './components/TourScheduleManager';
import TourPriceSection from './components/TourPriceSection';
import TourDescription from './components/TourDescription';

// Import hooks
import { useTourForm } from './hooks/useTourForm';
import { useImageUpload } from './hooks/useImageUpload';
import { useScheduleManager } from './hooks/useScheduleManager';
import { useAlert } from './hooks/useAlert';

function AddTourPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addTour, updateTour, getItinerary, getImages } = useContext(TourContext);
  const { user } = useContext(AuthContext);

  // Extract tour details for edit mode
  const tourDetail = location.state?.tourDetail || null; 
  //Check trạng thái để xác định có thể chỉnh sửa/ thêm tour được hay không
  const matchStatus = ((tourDetail?.status) ? (['active', 'upcoming'].includes(tourDetail.status)) : true); 

  const isEditMode = !!tourDetail;
  
  console.log("Tour detail: ", tourDetail);
  // Custom hooks
  const { alert, showAlert } = useAlert();
  const {
    values,
    setValues,
    handleInputChange,
    validateForm
  } = useTourForm(user.branch_id);

  const {
    selectedImages,
    displayImages,
    setDisplayImages,
    existingImages,
    setExistingImages,
    handleImageUpload,
    processFiles,
    removeImage,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useImageUpload();

  const {
    activeField,
    setActiveField,
    editingSchedule,
    sensors,
    handleActiveField,
    handleDragEnd,
    addSchedule,
    deleteSchedule,
    onEditSchedule,
    confirmEditSchedule
  } = useScheduleManager(values, setValues);

  // Fetch itinerary data when in edit mode
  useEffect(() => {
    const initializeEditMode = async () => {
      if (!isEditMode || !tourDetail) return;
      //If edit mode, get itinerary and images
      try {
        const itinerary = await getItinerary(tourDetail.tour_id);

        // Format prices
        const formattedPrices = Array.isArray(tourDetail.prices)
          ? tourDetail.prices.map(price => ({
            age_group: price.age_group,
            price: price.price.toString()
          }))
          : [];

        // Update form values
        setValues(prev => ({
          ...prev,
          ...tourDetail,
          prices: formattedPrices,
          itinerary: Array.isArray(itinerary) ? itinerary : [],
        }));

        //Get images from server
        const images = await getImages(tourDetail.tour_id);
        // Load images if any
        if (images && images.length > 0) {
          const imageUrls = images.map(img => img.image_url);
          setDisplayImages(imageUrls);
          setExistingImages(imageUrls);
        }
      } catch (error) {
        console.error("Error loading tour data:", error);
        showAlert('Không thể tải dữ liệu tour. Vui lòng thử lại sau.', 'danger');
      }
    };

    initializeEditMode();
  }, []);

  console.log("values: ", values);


  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("selectedImages: ", selectedImages);
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      showAlert(validation.message, 'danger');
      return;
    }

    const formattedPrices = values.prices.map(price => ({
      age_group: price.age_group,
      price: parseInt(price.price.replace(/\./g, '')) || 0 // Chuyển thành số, mặc định 0 nếu không hợp lệ
    }));

    // Chuẩn bị dữ liệu để gửi đến API
    const tourData = {
      ...values,
      //Nếu đang chỉnh sửa tour thì tour_id là tourDetail.tour_id, ngược lại là mới tạo tour_id mới
      tour_id: isEditMode ? tourDetail.tour_id : uuidv4().replace(/-/g, '').slice(0, 10),
      prices: formattedPrices,
      images: selectedImages, // Quan trọng: Gửi selectedImages để uploadAPI.js có thể xử lý
      existingImages: existingImages, // Chứa URL ảnh cũ
    };


    console.log("tourData: ", tourData);
    try {
      if (isEditMode) {
        await updateTour(tourData, tourData.tour_id);
        showAlert('Cập nhật tour thành công', 'success');
      } else {
        await addTour(tourData);
        showAlert('Thêm tour thành công', 'success');
      }

      // Redirect after successful operation
      setTimeout(() => navigate('/businessemployee/managetour'), 500);
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  return (
    <>
      {/* Alert message */}
      {alert.show && (
        <Alert
          variant={alert.variant}
          style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: '1000' }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Page title */}
      <h2 style={{ color: '#339688', fontWeight: 'bold', marginLeft: '20px' }}>
        {isEditMode ? 'Chỉnh Sửa Tour' : 'Thêm Tour Mới'}
      </h2>

      {/* Main form container */}
      <Container fluid className="tour-booking-form py-4">
        <Form onSubmit={handleSubmit}>
          {/* Tour name and exit button */}
          <Row className="mb-3 mt-3 d-flex justify-content-between align-items-center">
            <Col md={3}>
              <InputFiledIcon
                label="Tên tour"
                value={values.name}
                placeholder="Nhập tên tour"
                onChange={handleInputChange}
                name="name"
                required={true}
              />
            </Col>
            <Col md={3} className="d-flex justify-content-end">
              <Button
                variant="danger"
                className="px-4 exit-button"
                onClick={() => navigate('/businessemployee/managetour')}
              >
                Thoát
              </Button>
            </Col>
          </Row>

          {/* Tour basic information section */}
          <TourBasicInfo values={values} onChange={handleInputChange} />

          {/* Tour pricing section */}
          <TourPriceSection
            prices={values.prices}
            onChange={handleInputChange}
          />

          {/* Tour description */}
          <TourDescription
            value={values.description}
            onChange={handleInputChange}
          />

          {/* Tour image uploader */}
          <TourImageUploader
            selectedImages={selectedImages}
            displayImages={displayImages}
            imageCount={displayImages.length}
            processFiles={processFiles}
            removeImage={removeImage}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleImageUpload={handleImageUpload}
          />

          {/* Tour schedule manager */}
          <TourScheduleManager
            activeField={activeField}
            handleActiveField={handleActiveField}
            values={values}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            deleteSchedule={deleteSchedule}
            onEditSchedule={onEditSchedule}
            setActiveField={setActiveField}
            confirmEditSchedule={confirmEditSchedule}
            addSchedule={addSchedule}
            editingSchedule={editingSchedule}
          />

          {/* Submit button */}
          <Button
            variant="success"
            className="mt-3 p-20-50"
            style={{ display: "block", marginLeft: 'auto' }}
            type="submit"
            disabled={!matchStatus} // Disable if tourDetail is not set
          >
            {isEditMode ? 'Cập Nhật Tour' : 'Thêm Tour'}
          </Button>
        </Form>
      </Container>

      {/* Overlay for form modals */}
      {activeField && <div className="overlay" />}
    </>
  );
}

export default AddTourPage;