class Globals {
}

class DevelopmentGlobals extends Globals {
    public admin = {
        adminMenu: "http://localhost:8080/api/adminMenu",
        addCompany: "http://localhost:8080/api/admin/addCompany",
        addCustomer: "http://localhost:8080/api/admin/addCustomer",
        getAllCompanies: "http://localhost:8080/api/admin/getAllCompanies",
        getAllCustomers: "http://localhost:8080/api/admin/getAllCustomers",
        getOneCompany: "http://localhost:8080/api/admin/getOneCompany/",
        getOneCustomer: "http://localhost:8080/api/admin/getOneCustomer/",
        updateCompany: "http://localhost:8080/api/admin/updateCompany/",
        updateCustomer: "http://localhost:8080/api/admin/updateCustomer",
        deleteCompany: "http://localhost:8080/api/admin/deleteCompany/",
        deleteCustomer: "http://localhost:8080/api/admin/deleteCustomer/",
    }
    public company = {
        addCoupon: "http://localhost:8080/api/company/addCoupon",
        deleteCoupon: "http://localhost:8080/api/company/deleteCoupon/",
        getAllCoupons: "http://localhost:8080/api/company/allCoupons",
        getCompanyDetails: "http://localhost:8080/api/company/companyDetails/",
        getCouponByCategory: "http://localhost:8080/api/company/allCouponsByCategory/",
        getCouponByMaxPrice: "http://localhost:8080/api/company/allCouponsByMaxPrice/",
        updateCoupon: "http://localhost:8080/api/company/updateCoupon",
        updateDetails: "http://localhost:8080/api/company/updateDetails",
        getOneCompanyCoupon: "http://localhost:8080/api/company/getOneCompany/"
    }
    public customer = {
        purchaseCoupon: "http://localhost:8080/api/customer/purchaseCoupon/",
        getAllCoupons: "http://localhost:8080/api/customer/customerCoupons",
        getCouponsByCategory: "http://localhost:8080/api/customer/customerCouponsByCategory",
        getCouponsByMaxPrice: "http://localhost:8080/api/customer/customerCouponsByMaxPrice",
        getCustomerDetails: "http://localhost:8080/api/customer/customerDetails",
        updateDetails: "http://localhost:8080/api/customer/updateDetails",
    }
    public coupon = {
        allCoupons: "http://localhost:8080/api/allCoupons/",
    }
    public guest ={
        allSystemCoupons: "http://localhost:8080/api/guest/allSystemCoupons",
        allCouponsByMaxPrice: "http://localhost:8080/api/guest/allCouponsByMaxPrice",
        allCouponsByCategory: "http://localhost:8080/api/guest/allCouponsByCategory",
        register: "http://localhost:8080/api/guest/register",
    }
    public urls = {
        login: "http://localhost:8080/api/login",
        guest: "http://localhost:8080/api/",
    }
}

class ProductionGlobals extends Globals {
    public admin = {
        adminMenu: "/api/adminMenu",
        addCompany: "/api/admin/addCompany",
        // FIX: Changed addCustomers to addCustomer (singular)
        addCustomer: "/api/admin/addCustomer",
        getAllCompanies: "/api/admin/getAllCompanies",
        getAllCustomers: "/api/admin/getAllCustomers",
        getOneCompany: "/api/admin/getOneCompany/",
        getOneCustomer: "/api/admin/getOneCustomer/",
        updateCompany: "/api/admin/updateCompany",
        updateCustomer: "/api/admin/updateCustomer",
        deleteCompany: "/api/admin/deleteCompany/",
        deleteCustomer: "/api/admin/deleteCustomer/",
    }
    public company = {
        addCoupon: "/api/company/addCoupon",
        deleteCoupon: "/api/company/deleteCoupon/",
        getAllCoupons: "/api/company/allCoupons",
        getCompanyDetails: "/api/company/companyDetails/",
        getCouponByCategory: "/api/company/allCouponsByCategory",
        getCouponByMaxPrice: "/api/company/allCouponsByMaxPrice",
        updateCoupon: "/api/company/updateCoupon",
        updateDetails: "/api/company/updateDetails",
        getOneCompanyCoupon: "/api/company/getOneCompany/"
    }
    public customer = {
        purchaseCoupon: "/api/customer/purchaseCoupon/",
        getAllCoupons: "/api/customer/customerCoupons",
        getCouponsByCategory: "/api/customer/customerCouponsByCategory/",
        getCouponsByMaxPrice: "/api/customer/customerCouponsByMaxPrice/",
        getCustomerDetails: "/api/customer/customerDetails",
        updateDetails: "/api/customer/updateDetails",
    }
    public coupon = {
        allCoupons: "/api/allCoupons",
    }
    public guest ={
        allSystemCoupons: "/api/guest/allSystemCoupons",
        allCouponsByCategory: "/api/guest/allCouponsByCategory",
        allCouponsByMaxPrice: "/api/guest/allCouponsByMaxPrice",
        register: "/api/guest/register",
    }
    public urls = {
        login: "/api/login",
    }
}

const globals = process.env.NODE_ENV === 'production' ? new ProductionGlobals() : new DevelopmentGlobals();

export default globals;