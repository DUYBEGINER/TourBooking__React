import React, { useState } from 'react';
import DropDownButton from '../../Common/DropDown/DropDownButton';
import "./FilterLayoutStyle.scss";
import SearchFilter from '../../Common/SearchFilter/SearchFilter';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { RiDeleteBin2Fill } from "react-icons/ri";
import { GoPlus } from "react-icons/go";
import { useNavigate } from "react-router-dom";


function TourFilterEmployee({ 
  onSearch, 
  onSort, 
  onBlockSelected, 
  selectedItems = [],
  searchPlaceholder = "Tìm kiếm theo tên tour",
  occupancyFilters,
}) {
    const navigate = useNavigate();
    
    // Get occupancy filter options
    // const occupancyFiltersList = getOccupancyFilters();

    const handleSearch = (value) => {
        
        if (onSearch) {
            onSearch({search: value});
        }
    };
    
    const handleSort = (sortKey) => {
        if (onSort) { 
            onSort(sortKey);
        }
    };
    
    const handleDeleteSelected = () => {
        if (onBlockSelected && selectedItems.length > 0) {
            onBlockSelected();
        }
    };

    return (
        <div>
            <div className="filter__area">
                <div className="filter__dropdownbtn">
                    <p>Sắp xếp</p>
                    <DropDownButton 
                        title="Tất cả" 
                        dropitem={occupancyFilters.map(filter => ({
                            name: filter.label,
                            key: filter.key,
                        }))}
                        onChange={handleSort}
                    />
                </div>
                <div className="filter__search">
                    <SearchFilter 
                        onSearch={handleSearch} 
                        placeholder={searchPlaceholder} 
                    />
                </div>
                <ButtonToolbar aria-label="Toolbar with button groups" className="filter__button-toolbar">
                    <ButtonGroup className="me-2" aria-label="First group" >
                        <Button 
                            variant="danger" 
                            className='flex-center gap-2'
                            onClick={handleDeleteSelected}
                            disabled={selectedItems.length === 0}
                        >
                            Khóa tour đã chọn {selectedItems.length > 0 && `(${selectedItems.length})`} <RiDeleteBin2Fill />
                        </Button>
                    </ButtonGroup>
                    
                    <ButtonGroup className="me-2" aria-label="Second group" >
                        <Button 
                            variant="success" 
                            className='flex-center gap-2' 
                            onClick={() => navigate("addtour", {state: {tourDetail: null}})}
                        >
                            Thêm tour <GoPlus />
                        </Button>
                    </ButtonGroup>
                </ButtonToolbar>
            </div>
        </div>
    );
}

export default TourFilterEmployee;         