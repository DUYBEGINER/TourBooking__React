import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faUser, faCalendarDays, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FaMoneyBillAlt } from "react-icons/fa";
import styles from "./SearchBar.module.scss";
import SearchbarMobile from "./SearchbarMobile";
import {useNavigate}   from "react-router-dom";
const Searchbar = (props) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();
    const [values, setValues] = useState({
        name: "",
        date: "",
        budget: "",
    });


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });
    };

    const handleSearch = ()=> {
        navigate("/findtour", 
            { state: {filterInfor : values}} // Truyền giá trị ngân sách, địa điểm và ngày vào state
        );
    }

    // console.log("Searchbar values: ", values);
    // // Xử lý thay đổi giá trị dropdown
    // const handleBudgetChange = (e) => {
    //     setBudget(e.target.value);
    // };

    return (
        <div className={styles.searchbarContainer}>
            <div className={styles.searchbarMobile}>
                <SearchbarMobile />
            </div>
            {/* Mobile Search Toggle Button */}
           

            {/* Search Form */}
            <div className={styles.searchForm}>
                <div className={styles.searchItem}>
                    <span className={styles.searchLabel}>
                        <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                        Bạn muốn đi đâu?
                    </span>
                    <input name="name" onChange={handleInputChange} type="text" placeholder="Khám phá cuộc phiêu lưu mới" className={styles.searchInput} maxLength="10"/>
                </div>

                <div className={styles.separator}></div>

                <div className={styles.searchItem}>
                    <span className={styles.searchLabel}>
                        <FaMoneyBillAlt className={styles.icon}/>
                        Ngân sách 
                    </span>
                    <select
                        name="budget"
                        value={values.budget}
                        onChange={handleInputChange}
                        className={styles.searchInput} // Sử dụng cùng class với input để giữ giao diện
                    >
                        <option value="" disabled>Chọn mức giá</option>
                        <option value="under-5m">Dưới 5 triệu</option>
                        <option value="5m-10m">5 triệu - 10 triệu</option>
                        <option value="10m-20m">10 triệu - 20 triệu</option>
                        <option value="over-20m">Trên 20 triệu</option>
                    </select>
                </div>
                
                <div className={styles.separator}></div>

                <div className={styles.searchItem}>
                    <span className={styles.searchLabel}>
                        <FontAwesomeIcon icon={faCalendarDays} className={styles.icon}/>
                        Ngày đi
                    </span>
                    <input name="date" onChange={handleInputChange} type="date" className={styles.searchInput} /> 
                </div>

                <button className={styles.searchButton} onClick={handleSearch}>Tìm kiếm</button>
            </div>
        </div>
    );
}

export default Searchbar;