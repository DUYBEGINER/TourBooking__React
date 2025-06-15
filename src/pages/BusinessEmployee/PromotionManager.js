import React, {useState, useEffect} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PromotionFilterEmployee from '../../components/Employee/Filter/PromotionFilterEmployee';
import DataTable from '../../components/Common/DataTable/DataTable';
import {getPromotionList, blockPromotion, blockBatchPromotion} from '../../api/promotionAPI';
import { useNavigate } from 'react-router-dom';
import { RiResetLeftFill } from "react-icons/ri";
import ConfirmDialog from '../../components/Common/ConfirmDialog/ConfirmDialog';
import Alert from 'react-bootstrap/Alert';

function PromotionManager(props) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPromotions, setSelectedPromotions] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [promotionToBlock, setPromotionToBlock] = useState(null); // Promotion đang được khóa
    const [isBatchBlockPromotion, setIsBatchBlockPromotion] = useState(false); // Biến để xác định có đang khóa nhiều khuyến mãi cùng lúc hay không
    
    const [showSuccess, setShowSuccess] = useState(false); // Biến để xác định có thành công hay không
    const [successMessage, setSuccessMessage] = useState('');
    const [blockError, setBlockError] = useState(null);

    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
    });
    
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


    // Lấy danh sách khuyến mãi dựa trên bộ lọc
    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const queryParams = {};
            if (filters.status !== 'all') {
                queryParams.status = filters.status; // Lọc theo trạng thái khuyến mãi
            }else{
                queryParams.status = 'all'; // Mặc định là lấy khuyến mãi đang hoạt động
            }
            if (filters.search) {
                queryParams.promo_name = filters.search; // Tim kiếm theo tên khuyến mãi
            }
            console.log("Query Params:", queryParams);
            const data = await getPromotionList(queryParams);
            setPromotions(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Gọi API khi bộ lọc thay đổi
    useEffect(() => {
        console.log("Filters changed effect run");
        fetchPromotions();
    }, [filters]);

    console.log("filters:", filters);

    const columns = [
        {key: 'promo_id', label: 'Id khuyến mãi'},
        {key: 'promo_name', label: 'Tên khuyến mãi'},
        {key: 'code', label: 'Mã khuyến mãi'},
        {key: 'discount_percentage', label: 'Giảm giá'},
        {key: 'start_date', label: 'Ngày bắt đầu'},
        {key: 'end_date', label: 'Ngày kết thúc'},
        {key: 'max_use', label : "SL còn lại"},
        {key: 'status', label : "Trạng thái"}
    ]

     // Định nghĩa các hành động (button) cho mỗi cột trong bảng
    const actions = [
        {
            label: 'Tạm ngưng',
            variant: 'danger',
            onClick: async (id) => {
                setPromotionToBlock(id); //Lưu id khuyến mãi cần khóa
                setIsDialogOpen(true); // Mở dialog xác nhận khóa khuyến mãi
                setIsBatchBlockPromotion(false); // Không phải khóa hàng loạt
            },
        },
        {
            label: 'Chi tiết',
            variant: 'success',
            onClick: (id, promoDetail) => {            
                navigate("/businessemployee/promotion/addpromotion", {
                state: { promotionDetail: promoDetail }
                });
            },
        },
    ];

    const handleBlockSelected = () => {
        setIsDialogOpen(true);
        setIsBatchBlockPromotion(true); // Đánh dấu là khóa hàng loạt
    }

    const checkConfirmBlock = async (isConfirmed) => {
        if (isConfirmed) {
            try{
                if(isBatchBlockPromotion) {
                    await blockBatchPromotion(selectedPromotions);
                    setSelectedPromotions([]);
                    setPromotions((prev) => prev.filter((promo) => !selectedPromotions.includes(promo.promo_id))); // Cập nhật danh sách khuyến mãi
                    //Hiện thông báo thành công
                    setSuccessMessage(`${selectedPromotions.length} khuyến mãi đã được tạm ngưng thành công!`);
                    setShowSuccess(true);
                } else if (promotionToBlock) {
                    await blockPromotion(promotionToBlock);
                    setSelectedPromotions((prev) => prev.filter((promoId) => promoId !== promotionToBlock));
                    setPromotions((prev) => prev.filter((promo) => promo.promo_id !== promotionToBlock)); // Cập nhật danh sách khuyến mãi
                    // Hiện thông báo thành công
                    setSuccessMessage(`Khuyến mãi với ID ${promotionToBlock} đã được tạm ngưng thành công!`);
                    setShowSuccess(true);
                }
            } catch (error) {
                console.error('Error blocking promotions:', error);
                setBlockError("Đã xảy ra lỗi khi tạm ngưng khuyến mãi!");
            }     
        }
        setIsDialogOpen(false); // Đóng dialog sau khi xác nhận
        setPromotionToBlock(null); // Reset promotionToBlock
        setIsBatchBlockPromotion(false); // Reset trạng thái khóa hàng loạt
    }
    console.log("Selected promotions:", selectedPromotions);

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setSelectedPromotions([]); // Reset selected items when filters change
    };

    return (
        <div>
            <div className="alert-area" style={{ 
                position: 'fixed', 
                top: '50px', 
                right: '30%', 
                zIndex: 9999, 
                width: '600px' 
            }}>
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible >
                        {error}
                    </Alert>
                )}
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
           <Container fluid >
            <Row>
                <PromotionFilterEmployee
                    selectedItems={selectedPromotions}
                    onSelectChange={setSelectedPromotions}
                    onBlockSelected={handleBlockSelected}
                    onFilterChange={handleFilterChange}
                />
            </Row>
            <Row>
                <DataTable
                    data={promotions}
                    columns={columns}
                    actions={actions}
                    isLoading={isLoading}
                    error={error ? error.message : null}
                    itemsPerPage={12}
                    selectedItems={selectedPromotions}
                    onSelectChange={setSelectedPromotions}
                    idKey='promo_id'
                />
            </Row>
           </Container>
            {isDialogOpen && (
                <ConfirmDialog
                message="Bạn chắc muốn xóa khuyến mãi này?"
                checkConfirm={checkConfirmBlock}
                />
            )}
            
        </div>
    );
}

export default PromotionManager;