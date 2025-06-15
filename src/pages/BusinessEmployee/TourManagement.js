import { useState, useContext, useEffect,useMemo, useCallback } from "react";
import { Container } from "react-bootstrap";
import { Row } from "react-bootstrap";
import TourFilterEmployee from "../../components/Employee/Filter/TourFilterEmployee";
import DataTable from "../../components/Common/DataTable/DataTable";
import { TourContext } from "../../context/TourContext";
import StatusFilterEmployee from "../../components/Employee/StatusFilter_Employee/StatusFilterEmployee";
import { useNavigate } from "react-router-dom";
import { getOccupancyFilters, sortToursByAvailability} from "../../utils/tourFilterHelpers";
import ConfirmDialog from "../../components/Common/ConfirmDialog/ConfirmDialog";
import Alert from 'react-bootstrap/Alert';

const TourManagementEmp = () => {
  const navigate = useNavigate();
  const { tours, isLoading, error, fetchTours, blockTour, blockBatchTour } = useContext(TourContext);
 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tourToBlock, setTourToBlock] = useState(null); // Tour đang được khóa
  const [isBatchBlockTour, setIsBatchBlockTour] = useState(false); // Biến để xác định có đang khóa nhiều tour cùng lúc hay không
  // Các trạng thái lọc và sắp xếp
  const [sortOrder, setSortOrder] = useState(null);
  const [selectedTour, setSelectedTour] = useState([]); // Mảng chứa các tour đã chọn
  const occupancyFilters = useCallback(getOccupancyFilters(), []);

  const [showSuccess, setShowSuccess] = useState(false); // Biến để xác định có thành công hay không
  const [successMessage, setSuccessMessage] = useState('');
  const [blockError, setBlockError] = useState(null);

  const [filters, setFilters] = useState({
          status: 'all',
          search: '',
  });
  
  console.log('tours', tours);

  // Tự động ẩn thông báo sau 3 giây
    useEffect(() => {
        if (showSuccess || blockError) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
                setBlockError(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, blockError]);

  useEffect(() => {
    console.log("TourManagementEmp useEffect run");
    fetchTours(filters);
  }, [filters]);

  // Columns cho bảng
  const columns = [
    { key: 'tour_id', label: 'Mã tour' },
    { key: 'name', label: 'Tên tour' },
    { key: 'available_seats', label: 'Số chổ trống' },
    { key: 'start_date', label: 'Ngày khởi hành' },
    { key: 'end_date', label: 'Ngày trở về' },
    { key: 'status', label: 'Trạng thái' },
  ];

  // Định nghĩa các hành động (button) cho mỗi cột trong bảng
  const actions = [
    {
      label: 'Khóa',
      variant: 'danger',
      onClick: async (id) => {
        setTourToBlock(id); //Lưu id tour cần khóa
        setIsDialogOpen(true); // Mở dialog xác nhận khóa tour
        setIsBatchBlockTour(false); // Không phải khóa hàng loạt
      },
      condition: (item) => ['active', 'upcoming'].includes(item.status), // Chỉ cho phép khóa với status active hoặc upcoming
    },
    {
      label: 'Chi tiết',
      variant: 'success',
      onClick: (id, tourDetail) => {
        navigate("/businessemployee/managetour/addtour", {
          state: { tourDetail: tourDetail }
        });
      },
      // condition: (item) => ['active', 'upcoming'].includes(item.status), // Chỉ cho phép sửa với status active hoặc upcoming
    },
  ];

  console.log("Selected tours:", selectedTour);

  const handleBlockSelected = () => {
    setIsDialogOpen(true); // Mở dialog xác nhận khóa tour
    setIsBatchBlockTour(true); // Đánh dấu là khóa hàng loạt
  };

  const checkConfirmBlock = async (isConfirmed) => {
    if (isConfirmed) {
      try{
        if(isBatchBlockTour){
          //Khóa các tour đã chọn
          await blockBatchTour(selectedTour);
          setSelectedTour([]);
          setShowSuccess(true);
          setSuccessMessage(`${selectedTour.length} tour đã được khóa thành công!`);
        }
        else if (tourToBlock) {
          //Khóa tour đơn lẻ
          await blockTour(tourToBlock);
          setSelectedTour((prev) => prev.filter((tourId) => tourId !== tourToBlock));
          setShowSuccess(true);
          setSuccessMessage(`Tour với ID ${tourToBlock} đã được khóa thành công!`);
        }
      } catch (error) {
        console.error('Lỗi khi khóa tour:', error);
        setBlockError("Đã xảy ra lỗi khi tạm ngưng khuyến mãi!");
        // alert("Đã xảy ra lỗi khi khóa tour!");
      }
    }
    //Đóng dialog và reset trạng thái
    setIsDialogOpen(false);
    setTourToBlock(null);
    setIsBatchBlockTour(false);
  };

  // Sắp xếp tours bằng useMemo
  const sortedTours = useMemo(() => {
    if (!tours || tours.length === 0) return [];
    let result = [...tours];

    if (sortOrder) {
      console.log("Sorting tours by availability with order:", sortOrder);
      result = result.sort(sortToursByAvailability(sortOrder));
    }
    return result;
  }, [tours, sortOrder]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    setSelectedTour([]); // Reset selected tours when filters change
      setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  
  const handleSort = (order) => {
    setSortOrder(order);
  };
  

  return (
    <>
    <div className="alert-area" style={{ 
        position: 'fixed', 
        top: '50px', 
        right: '30%', 
        zIndex: 9999, 
        width: '600px' 
      }}>
        {showSuccess && (
            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible transition={true}>
                {successMessage}
            </Alert>
        )}
        {blockError && (
            <Alert variant="danger" onClose={() => setBlockError(null)} dismissible >
                {blockError}
            </Alert>
        )}
    </div>
    <Container fluid>
      <Row>
        <TourFilterEmployee 
          onSearch={handleFilterChange}
          onSort={handleSort}
          onBlockSelected={handleBlockSelected}
          selectedItems={selectedTour}
          searchPlaceholder="Tìm kiếm theo tên hoặc mã tour"
          occupancyFilters={occupancyFilters}
        />
      </Row>
      <Row>
        <StatusFilterEmployee onFilterChange={handleFilterChange} />
      </Row>
      <Row>
        <DataTable 
          data={sortedTours}
          columns={columns}
          actions={actions}
          itemsPerPage={12}
          isLoading={isLoading}
          error={error ? error.message : null}
          selectedItems={selectedTour}
          onSelectChange={setSelectedTour}
          idKey="tour_id"/>
      </Row>
      
    </Container>
    {isDialogOpen && (
        <ConfirmDialog
          message="Bạn có chắc muốn xóa tour này?"
          checkConfirm={checkConfirmBlock}
        />
      )}
    </>
  );
};

export default TourManagementEmp;
