import React, {useRef, useEffect, useState} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import FilterTourCard from '../../components/FilterTourCard/FilterTourCard';
import NavBar from '../../layouts/Navbar';
import Footer from '../../layouts/Footer';
import TourCardHorizon from '../../components/Common/TourCard/TourCardHorizon';
import "../../styles/pages/FindTourContainer.scss";
import DropDownButton from '../../components/Common/DropDown/DropDownButton';
import { useLocation } from 'react-router-dom';
import {getTourByFilter} from '../../api/tourAPI';
import {Link} from 'react-router-dom';

function FindTour(props) {
    const location = useLocation();
    const findTourPageRef = useRef(null);
    console.log("find tour render")
    const [tours, setTours] = useState([]);
    const [originalTours, setOriginalTours] = useState([]); // Lưu danh sách ban đầu
    const [countResults, setCountResults] = React.useState(0);

    const filterInfor = location.state?.filterInfor || null;
    console.log("Filter Information from location state: ", filterInfor);

    const dropDownItems = [
        {key: "all", name: "Tất cả"},
        {key: "price_asc", name: "Giá thấp đến cao"},
        {key: "price_desc", name: "Giá cao đến thấp"},
    ]


    const handleSort = (key) => {
        console.log("Sort by: ", key);
        if (key === "price_asc") {
        setTours([...tours].sort((a, b) => a.price - b.price));
        } else if (key === "price_desc") {
        setTours([...tours].sort((a, b) => b.price - a.price));
        } else if (key === "all") {
        setTours([...originalTours]); // Khôi phục danh sách ban đầu
        }
  };

    console.log("tourData", tours);
    console.log("Filter Information: ", filterInfor);

    useEffect(() => {
        const fetchData = async () => {
            const tourData = await getTourByFilter(filterInfor);
            setTours(tourData.tours);
            setOriginalTours(tourData.tours); // Lưu danh sách ban đầu
            setCountResults(tourData.count);
        };
        fetchData();
    }, []);

    const handleSubmit = async (filter) => {
        // e.preventDefault();
        const tourData = await getTourByFilter(filter);
        setTours(tourData.tours);
        setOriginalTours(tourData.tours); // Lưu danh sách ban đầu
        setCountResults(tourData.count);
        console.log("Submitted filter: ", filter);
    };

    console.log("FindTour component rendered");
    return (
        <div className="findTour_Page" ref={findTourPageRef}>
            <NavBar pageRef={findTourPageRef}/>
            <Container className="findTour_Container">
                <Row className="mb-5">
                    <Link to="/">Trở về trang chủ</Link>
                </Row>
                <Row className="mb-5">
                    <h2 className="searchText text-center">
                        {filterInfor.name === '' ? 'Tất cả tour' : (<p>Đang tìm kiếm tour liên quan đến <span className="highlight">{filterInfor.name}</span></p>)}
                    </h2>
                </Row>
                <Row className="mb-3 fw-bold"> 
                    <Col md={3} className="fz-18">BỘ LỌC TÌM KIẾM</Col>  
                    <Col className="flex justify-content-between" md={9}>
                        <h2>Đã tìm được {countResults} tour</h2>
                        <div className="sort_Area flex"> 
                            <p className="sort-text">Sắp xếp theo:</p>
                            <DropDownButton onChange={handleSort} className="dropDown_Sort" title="Tất cả" dropitem={dropDownItems} /> 
                        </div> 
                    </Col>

                </Row>
                <Row >
                    <Col md={3}>
                    <div className="filterTour-card">
                        <FilterTourCard filterInfor={filterInfor} submit={handleSubmit}/>
                    </div>
                    </Col>
                    <Col md={9} className="filterTour_List">
                    {tours.length === 0 ? (
                        <p className="text-center">Không có tour nào phù hợp với tiêu chí tìm kiếm.</p>
                    ) : (
                        tours.map((tour, index) => (
                            <Row key={index} style={{marginBottom: '20px'}}>
                                <TourCardHorizon tour={tour} />
                            </Row>
                        ))
                    )}
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );
}

export default FindTour;