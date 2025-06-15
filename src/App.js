import { Routes, Route, Link } from "react-router-dom";
import "./styles/payment.css";
import Page from "./pages/User/Home";
import Register from "./pages/User/Register";
import Login from "./pages/User/Login";
import ScrollToTop from "./feature/scrollToTop";
import Contact from "./pages/User/Contact";
import TourManagementEmp from "./pages/BusinessEmployee/TourManagement";
import MainLayout from "./pages/Admin/layout/MainLayout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import StaffManagement from "./pages/Admin/Employees/EmployeeList";
import EmployeeProfile from "./pages/Admin/Employees/EmployeeProfile";
import TourManagement from "./pages/Admin/Tours/TourList";
import BranchManagement from "./pages/Admin/Branches/BranchList";
import BusinessEmployee from "./pages/BusinessEmployee/BusinessEmployee";
import AddNewTour from "./pages/BusinessEmployee/AddNewTour/AddNewTour";
import InforUser from "./pages/User/InforUser";
import ConsultantEmployee from "./pages/ConsultantEmployee/ConsultantEmployee";
import Chatbot from "./pages/ConsultantEmployee/ChatBot";
import ResponeSupport from "./pages/ConsultantEmployee/ResponeSupport";
import ResponeDetail from "./pages/ConsultantEmployee/ResponeDetail";
import { TourProvider } from "./context/TourContext";
import { ConsultantSupportProvider } from "./context/ConsultantSupportContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import NotFound from "./pages/NotFound";
import AddNewEmployee from "./pages/Admin/Employees/AddEmployee";
import CustomerManagement from "./pages/BusinessEmployee/CustomerManagement";
import InforCustomer from "./pages/BusinessEmployee/InforCustomer/InforCustomer";
import BookingTour from "./pages/User/BookingTour";
import BookingInfo from "./pages/User/BookingInfo";
import { CustomerProvider } from "./context/CustomerContext";
import PromotionManager from "./pages/BusinessEmployee/PromotionManager";
import BranchInfo from "./pages/Admin/Branches/BranchInfo";
import Checkout from "./pages/User/Checkout";
import AddNewPromotion from "./pages/BusinessEmployee/AddNewPromotion/AddNewPromotion";
import PaymentResult from "./pages/Payment/PaymentResult";
import PaymentDemo from "./pages/Payment/PaymentDemo";
import MoMoTestPage from "./pages/Payment/MoMoTestPage";
import FindTour from "./pages/User/FindTour";
import TourFavourite from "./pages/User/TourFavourite";
import AboutUs from './pages/User/AboutUs';
import AdminAccounts from "./pages/Admin/Accounts/AdminAccounts";
import TourHistory from "./pages/User/TourHistory";
import InforEmployee from "./pages/BusinessEmployee/InforEmployee/InforEmployee";
import ForgotPassword from "./pages/User/ForgotPassword";
import VerifyOTP from "./pages/User/VerifyOTP";
import ResetPasswordPage from "./pages/User/ResetPassword/ResetPasswordPage";
import BookingHistoryCustomer from "./pages/BusinessEmployee/BookingHistoryCustomer/BookingHistoryCustomer";


function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <ConsultantSupportProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Page />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/booking" element={<BookingTour />} />
          <Route path="/findtour" element={<FindTour />} />
          <Route path="/user/booking-info" element={<BookingInfo />} />
          <Route path="/historyBooking" element={<TourHistory />} />
          <Route path="/tourFavorite" element={ <ProtectedRoute allowedRoles={["customer"]}> <TourFavourite /> </ProtectedRoute> } />
          <Route path="/contact" element={ <ProtectedRoute allowedRoles={["customer"]}> <Contact /> </ProtectedRoute> } />
          <Route path="/payment/result" element={<PaymentResult />}/>
          <Route path="/payment/demo" element={<PaymentDemo />}/>
          <Route path="/payment/momo-test" element={<MoMoTestPage />}/>
          <Route path="/about-us" element={<AboutUs />} />

          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verifyOTP" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/thongtin" element={ <ProtectedRoute allowedRoles={["customer"]}> <InforUser /> </ProtectedRoute> } />
          {/* <Route path="/customer" element={<p>customer</p>} />
          <Route path="/sale" element={<p>sale</p>} />
          <Route path="/support" element={<p>support</p>} /> */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="*" element={<NotFound/>} />

          {/* Business Employee Routes */}
          <Route path="/businessemployee" element={ <ProtectedRoute allowedRoles={["Sales"]}> <BusinessEmployee /> </ProtectedRoute> }>
              {/* Route CustomerManagement*/}
              <Route path="customer" element={ <CustomerProvider> <CustomerManagement /> </CustomerProvider> } />
              <Route path="inforEmployee" element={<InforEmployee />} />
              <Route path="customer/inforcustomer" element={<CustomerProvider><InforCustomer /></CustomerProvider>} />
              <Route path="customer/inforcustomer/history" element={<BookingHistoryCustomer />} />
                {/* Route TourManagement*/}
              <Route path="managetour" element={<TourProvider> <TourManagementEmp /> </TourProvider> } />
              <Route path="managetour/addtour" element={ <TourProvider> <AddNewTour /> </TourProvider> } />
                {/* Route PromotionManagement*/}
              <Route path="promotion" element={<PromotionManager />} />
              <Route path="promotion/addpromotion" element={ <AddNewPromotion /> } />
          </Route>
          {/* End Business Employee Routes */}


          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout />
            </ProtectedRoute>
          }>
              {/* <Route index element={<Dashboard />} /> */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="staffManagement" element={<StaffManagement />} />
              <Route path="staffManagement/:id" element={<EmployeeProfile />} />
              <Route path="staffManagement/addNewEmployee" element={<AddNewEmployee />} />
              <Route path="tourManagement" element={<TourManagement />} />
              <Route path="branchManagement" element={<BranchManagement />} />
              <Route path="branchManagement/:id" element={<BranchInfo />} />
              <Route path="accounts" element={<AdminAccounts />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          {/* Consultant Employee Routes */}
          <Route path="/consultantemployee" element={
            <ProtectedRoute allowedRoles={["Support"]}>
              <ConsultantEmployee />
            </ProtectedRoute>
          }>
            {/* <Route path="chatbot" element={<Chatbot />} /> */}
            <Route path="request-support" element={<ResponeSupport />} />
            <Route path="request-support/:id" element={<ResponeDetail />} />
          </Route>
        </Routes>
      </ConsultantSupportProvider>
    </div >
  );
}

export default App;

