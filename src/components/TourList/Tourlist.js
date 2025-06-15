import React, { useContext } from "react";
import { TourContext } from "../../context/TourContext";
import TourCard from "../Common/TourCard/TourCard";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ShowAllButton from "../Common/Button/ShowAllButton";
import "./TourList.scss";
import { useNavigate} from "react-router-dom";

function Tourlist(props) {
  const navigate = useNavigate();
  const { tours, isLoading, error, onChangeFavoriteTour } = props;
  console.log(tours);
  if (isLoading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">Lỗi: {error.message}</div>;

  const values = {
    name: "",
    date: "",
    budget: "",
  }
  return (
    <div className="tourlist">
      <Container className="tourlist-container" fluid>
        <Row className="custom-row g-3" xs={1} sm={2} md={3} xl={4} xxl={5}>
          {tours.map((tour) => (
            <Col key={tour.tour_id} className="custom-col">
              <TourCard {...tour}  onFavoriteChange={onChangeFavoriteTour}/>
            </Col>
          ))}
        </Row>
        <div className="show-all-container">
          <ShowAllButton onClick={() => navigate("/findtour",
            { state: { filterInfor: values } }
          )} />
        </div>
      </Container>
    </div>
  );
}

export default Tourlist;