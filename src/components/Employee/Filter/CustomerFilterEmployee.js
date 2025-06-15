import React, { useState } from 'react';

import "./FilterLayoutStyle.scss";
import SearchFilter from '../../Common/SearchFilter/SearchFilter';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { RiDeleteBin2Fill } from "react-icons/ri";



function CustomerFilterEmployee(
    {onSearch,
    selectedItems = [],
    onDelete
    }
) 
{   
    const handleDeleteSelected = () => {
        if (onDelete && selectedItems.length > 0) {
            onDelete();
        }
    };
    return (
        <div>
            <div className="filter__area">
                <div className="filter__search">
                    <SearchFilter onSearch={onSearch} placeholder="Tìm kiếm theo tên tài khoản" />
                </div>
                <ButtonToolbar aria-label="Toolbar with button groups" className="filter__button-toolbar">
                    <ButtonGroup className="me-2" aria-label="First group" >
                        <Button  
                            variant="danger" 
                            onClick={handleDeleteSelected} 
                            className='flex-center gap-2'
                            disabled={selectedItems.length === 0}
                        >
                            Khóa tài khoản đã chọn {selectedItems.length > 0 && `(${selectedItems.length})`} <RiDeleteBin2Fill />
                        </Button>
                    </ButtonGroup>
                </ButtonToolbar>
            </div>

          
        </div>
    );
}

export default CustomerFilterEmployee;         