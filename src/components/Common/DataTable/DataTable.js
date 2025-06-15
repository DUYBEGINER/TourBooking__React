// src/components/Common/DataTable/DataTable.js
import React, { useState, useEffect, useContext} from 'react';
import { Table, Container, Button } from "react-bootstrap";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import './DataTable.scss';
import { TourContext } from "../../../context/TourContext";
import PaginationBar from '../Pagination/PaginationBar';

function DataTable(
  {
    data = [],   // Dữ liệu để hiển thị (mặc định là mảng rỗng)
    columns = [],   // Các cột cần hiển thị
    actions = [], // Các hành động có thể thực hiện
    onFilter = () => true, // Hàm lọc dữ liệu
    itemsPerPage = 10, // Số lượng mục hiển thị trên mỗi trang
    isLoading = false, // Trạng thái loading
    error = null, // Trạng thái lỗi
    formatDate = (dateString) => { // Hàm định dạng ngày tháng mặc định
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    selectedItems = [],
    onSelectChange = () => {},
    idKey = 'id', // Khóa duy nhất của mỗi mục (thay đổi tùy vào dữ liệu)
  }
) {


  const [selectedAll, setSelectedAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset trang về 1 khi dữ liệu thay đổi, giải pháp tạm thời, có thể thay đổi phân trang trên backend sau này
  useEffect(() => {
    setCurrentPage(1); 
  }, [data]);

  // Dữ liệu đã lọc
  const filteredData = data.filter(onFilter);

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedAll(false); // Reset trạng thái chọn tất cả khi chuyển trang
  };

  // Cập nhật trạng thái chọn tất cả cho trang hiện tại
  useEffect(() => {
    // Kiểm tra xem tất cả các mục trong trang hiện tại đã được chọn chưa
    const currentItemIds = currentItems.map(item => item[idKey]);
    const allCurrentSelected = currentItemIds.length > 0 && 
      currentItemIds.every(id => selectedItems.includes(id));
    
    setSelectedAll(allCurrentSelected);
  }, [currentItems, selectedItems, idKey, onSelectChange]);

  const handleSelectAll = () => {
    if (!selectedAll) {
      // Chỉ chọn các item trong trang hiện tại
      const currentItemIds = currentItems.map(item => item[idKey]);
      // Thêm các ID của trang hiện tại vào danh sách đã chọn
      const newSelected = [...new Set([...selectedItems, ...currentItemIds])]; // Tránh trùng lặp
      onSelectChange(newSelected);
      setSelectedAll(true);
    } else {
      // Bỏ chọn các item trong trang hiện tại
      const currentItemIds = currentItems.map(item => item[idKey]);
      const newSelected = selectedItems.filter((id) => !currentItemIds.includes(id));
      onSelectChange(newSelected);
      setSelectedAll(false);
    }
  };

  const handleChangeItem = (id) => {
    const newSelected = selectedItems.includes(id)
      ? selectedItems.filter((itemId) => itemId !== id)
      : [...selectedItems, id];
    onSelectChange(newSelected);
  };

  
  // Hàm render giá trị của cột
  const renderColumnValue = (item, column) => {
    const value = item[column.key];
    // if (column.format) {
    //   return column.format(value, item);
    // }

    if (column.key.includes('date') || column.key.includes('created_at') || column.key.includes('birthday')) {
      return formatDate(value);
    }
    return value;
  };

  
  return (
    <Container className="table-wrapper mt-2">
      <Table hover responsive borderless className="tour-management__table" >
        <thead className="bg-light">
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                name="selectAll"
                id="selectAll"
                checked={selectedAll}
                onChange={handleSelectAll}
              />
            </th>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions.length > 0 && <th></th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + 1 + (actions.length > 0 ? 1 : 0)}>Đang tải dữ liệu...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length + 1 + (actions.length > 0 ? 1 : 0)}>Lỗi: {error}</td>
            </tr>
          ) : currentItems.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1 + (actions.length > 0 ? 1 : 0)}>
                Không có dữ liệu để hiển thị.
              </td>
            </tr>
            ) : (
            currentItems.map((item) => (
              <tr key={item[idKey]} className="tour-management__table-row align-middle">
                <td>
                  <Form.Check
                    type="checkbox"
                    name="selectedItem"
                    id={`item-${item[idKey]}`}
                    checked={selectedItems.includes(item[idKey])}
                    onChange={() => handleChangeItem(item[idKey])}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key} className={column.key === `status` ? `${item.status}` : ''}>{renderColumnValue(item, column)}</td>
                ))}
                {actions.length > 0 && (
                   <td className="text-center">
                      {actions.map((action, index) => {
                        // Kiểm tra điều kiện để hiển thị hoặc vô hiệu hóa nút
                        const isActionEnabled = action.condition ? action.condition(item) : true;
                        return (
                            <ButtonGroup key={index} className="me-2" aria-label="Actions" >
                              <Button
                                key={index}
                                variant={action.variant}
                                size="sm"
                                onClick={() => action.onClick(item[idKey], item)}
                                disabled={!isActionEnabled} // Vô hiệu hóa nút nếu không thỏa mãn điều kiện
                              >
                                {action.label}
                              </Button>
                            </ButtonGroup>
                        );
                      })}
                    </td>
                  )}
              </tr>
              ))
          )}
        </tbody>
      </Table>
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <PaginationBar 
            currentPage={currentPage} 
            totalPages={totalPages} 
            handlePageChange={handlePageChange}
          />
        </div>
      )}
    </Container>
  );
}

export default DataTable;