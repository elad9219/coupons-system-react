import { Route, Routes } from "react-router-dom";

import MainPage from "../../mainLayout/mainPage/mainPage";
import Menu from "../../mainLayout/menu/menu";

import AddCompany from "../../admin/addCompany/addCompany";
import AddCustomer from "../../admin/addCustomer/addCustomer";
import DeleteCompany from "../../admin/deleteCompany/deleteCompany";
import DeleteCustomer from "../../admin/deleteCustomer/deleteCustomer";
import GetAllCompanies from "../../admin/getAllCompanies/getAllCompanies";
import GetAllCustomers from "../../admin/getAllCustomers/getAllCustomers";
import GetCustomer from "../../admin/getCustomer/getCustomer";
import GetOneCompany from "../../admin/getOneCompany/getOneCompany";
import UpdateCompany from "../../admin/updateCompany/updateCompany";
import UpdateCustomer from "../../admin/updateCustomer/updateCustomer";

import AddCoupon from "../../company/addCoupon/addCoupon";
import DeleteCoupon from "../../company/deleteCoupon/deleteCoupon";
import GetAllCompanyCoupons from "../../company/getAllCompanyCoupons/getAllCompanyCoupons";
import GetCompanyDetails from "../../company/getCompanyDetails/getCompanyDetails";
import UpdateCoupon from "../../company/updateCoupon/updateCoupon";
import UpdateCompanyDetails from "../../company/updateCompanyDetails/updateCompanyDetails";

import GetCustomerCoupons from "../../customer/getCustomerCoupons/getCustomerCoupons";
import GetCustomerDetails from "../../customer/getCustomerDetails/getCustomerDetails";

import Login from "../../user/login/login";
import Register from "../../user/register/register";
import Page404 from "../../user/page404/page404";

function MenuRouting(): JSX.Element {
    return (
        <div className="MenuRouting">
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="guest" element={<MainPage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                <Route path="adminMenu" element={<Menu />} />
                <Route path="admin/addCompany" element={<AddCompany />} />
                <Route path="admin/addCustomer" element={<AddCustomer />} />
                <Route path="admin/deleteCompany" element={<DeleteCompany />} />
                <Route path="admin/deleteCustomer" element={<DeleteCustomer />} />
                <Route path="admin/getAllCompanies" element={<GetAllCompanies />} />
                <Route path="admin/getAllCustomers" element={<GetAllCustomers />} />
                <Route path="admin/getCustomer" element={<GetCustomer />} />
                <Route path="admin/getOneCompany" element={<GetOneCompany />} />
                <Route path="admin/updateCompany" element={<UpdateCompany />} />
                <Route path="admin/updateCustomer" element={<UpdateCustomer />} />

                <Route path="company/addCoupon" element={<AddCoupon />} />
                <Route path="company/deleteCoupon" element={<DeleteCoupon />} />
                <Route path="company/allCoupons" element={<GetAllCompanyCoupons />} />
                <Route path="company/getComapnyDetails" element={<GetCompanyDetails />} />
                <Route path="company/updateCoupon" element={<UpdateCoupon />} />
                <Route path="company/update" element={<UpdateCompanyDetails />} />

                <Route
                    path="company/getCouponsByCategory"
                    element={<GetAllCompanyCoupons />}
                />
                <Route
                    path="company/getCouponsByMaxPrice"
                    element={<GetAllCompanyCoupons />}
                />

                <Route
                    path="customer/customerCoupons"
                    element={<GetCustomerCoupons />}
                />
                <Route
                    path="customer/customerDetails"
                    element={<GetCustomerDetails />}
                />
                <Route
                    path="customer/getCustomerCouponsByCategory"
                    element={<GetCustomerCoupons />}
                />
                <Route
                    path="customer/getCustomerCouponsByMaxPrice"
                    element={<GetCustomerCoupons />}
                />

                <Route path="*" element={<Page404 />} />
            </Routes>
        </div>
    );
}

export default MenuRouting;