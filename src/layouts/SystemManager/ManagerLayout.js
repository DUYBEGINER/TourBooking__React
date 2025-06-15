import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useContext, useMemo } from 'react';
import SideBar from '../../components/Common/Sidebar/SideBar';
import NavBarAdmin from '../../components/Common/NavBar_Admin/NavBarAdmin';
import "../../styles/layouts/Manager_layout.scss";
import { BusinessEmployeeSideBar, AdminSideBar, ConsultantEmployeeSideBar } from '../../utils/SideBarItem';
import { AuthContext } from '../../context/AuthContext';
import { Outlet } from 'react-router-dom';


function ManagerLayout() {

  const { user } = useContext(AuthContext);
  console.log("user manager: ", user);
  // Chọn layout dựa trên vai trò người dùng
  const layoutType = useMemo(() => {
    switch (user?.role) {
      case "Admin":
        return {
          sideBar: AdminSideBar,
          header: "Admin"
        };
      case "Sales":
        return {
          sideBar: BusinessEmployeeSideBar,
          header: "Nhân viên kinh doanh"
        };
      case "Support":
        return {
          sideBar: ConsultantEmployeeSideBar,
          header: "Nhân viên tư vấn"
        };
      default:
        return []; // Mặc định là rỗng nếu không có vai trò
    }
  }, [user?.role]);

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <Container fluid style={{ minHeight: '100vh' }}>
      <Row className='p-0 ' style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Col xs={2} className="p-0" style={{ zIndex: 0 }}>
          <SideBar navItems={layoutType.sideBar} />
        </Col>

        {/* Nội dung chính */}
        <Col xs={10} className="Manager__content  p-0">
          {/* Hàng 1: NavBar của quản lí */}
          <div className="Manager__navbar">
            <NavBarAdmin user={user} header={layoutType.header} />
          </div>
          {/* Hàng 2: Thông tin chính */}
          <div className="Manager__main-content">
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ManagerLayout;