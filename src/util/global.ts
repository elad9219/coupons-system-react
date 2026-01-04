class Globals {
}

class DevelopmentGlobals extends Globals {
    public admin = {
        adminMenu: "http://localhost:8080/adminMenu",
        addCompany: "http://localhost:8080/admin/addCompany",
        addCustomer: "http://localhost:8080/admin/addCustomer",
        getAllCompanies: "http://localhost:8080/admin/getAllCompanies",
        getAllCustomers: "http://localhost:8080/admin/getAllCustomers",
        getOneCompany: "http://localhost:8080/admin/getOneCompany/",
        getOneCustomer: "http://localhost:8080/admin/getOneCustomer/",
        updateCompany: "http://localhost:8080/admin/updateCompany/",
        updateCustomer: "http://localhost:8080/admin/updateCustomer",
        deleteCompany: "http://localhost:8080/admin/deleteCompany/",
        deleteCustomer: "http://localhost:8080/admin/deleteCustomer/",
    }
    public company = {
        addCoupon: "http://localhost:8080/company/addCoupon",
        deleteCoupon: "http://localhost:8080/company/deleteCoupon/",
        getAllCoupons: "http://localhost:8080/company/allCoupons",
        getCompanyDetails: "http://localhost:8080/company/companyDetails/",
        getCouponByCategory: "http://localhost:8080/company/allCouponsByCategory/",
        getCouponByMaxPrice: "http://localhost:8080/company/allCouponsByMaxPrice/",
        updateCoupon: "http://localhost:8080/company/updateCoupon",
        updateDetails: "http://localhost:8080/company/updateDetails",
        // Removed getAllCompanyCoupons2 line
        getOneCompanyCoupon: "http://localhost:8080/company/getOneCoupon/"
    }
    public customer = {
        purchaseCoupon: "http://localhost:8080/customer/purchaseCoupon/",
        getAllCoupons: "http://localhost:8080/customer/customerCoupons",
        getCouponsByCategory: "http://localhost:8080/customer/customerCouponsByCategory",
        getCouponsByMaxPrice: "http://localhost:8080/customer/customerCouponsByMaxPrice",
        getCustomerDetails: "http://localhost:8080/customer/customerDetails",
        updateDetails: "http://localhost:8080/customer/updateDetails",
    }
    public coupon = {
        allCoupons: "http://localhost:8080/allCoupons/",
    }
    public guest ={
        allSystemCoupons: "http://localhost:8080/guest/allSystemCoupons",
        allCouponsByMaxPrice: "http://localhost:8080/guest/allCouponsByMaxPrice",
        allCouponsByCategory: "http://localhost:8080/guest/allCouponsByCategory",
        register: "http://localhost:8080/guest/register",
    }
    public urls = {
        login: "http://localhost:8080/login",
        guest: "http://localhost:8080/",
    }
}

class ProductionGlobals extends Globals {
    public admin = {
        adminMenu: "/adminMenu",
        addCompany: "/admin/addCompany",
        addCustomer: "/admin/addCustomers",
        getAllCompanies: "/admin/getAllCompanies",
        getAllCustomers: "/admin/getAllCustomers",
        getOneCompany: "/admin/getOneCompany/",
        getOneCustomer: "/admin/getOneCustomer/",
        updateCompany: "/admin/updateCompany",
        updateCustomer: "/admin/updateCustomer",
        deleteCompany: "/admin/deleteCompany/",
        deleteCustomer: "/admin/deleteCustomer/",
    }
    public company = {
        addCoupon: "/company/addCoupon",
        deleteCoupon: "/company/deleteCoupon/",
        getAllCoupons: "/company/allCoupons",
        getCompanyDetails: "/company/companyDetails/",
        getCouponByCategory: "/company/allCouponsByCategory",
        getCouponByMaxPrice: "/company/allCouponsByMaxPrice",
        updateCoupon: "/company/updateCoupon",
        updateDetails: "/company/updateDetails",
        // Removed getAllCompanyCoupons2 line
        getOneCompanyCoupon: "/company/getOneCompany/"
    }
    public customer = {
        purchaseCoupon: "/customer/purchaseCoupon/",
        getAllCoupons: "/customer/customerCoupons",
        getCouponsByCategory: "/customer/customerCouponsByCategory/",
        getCouponsByMaxPrice: "/customer/customerCouponsByMaxPrice/",
        getCustomerDetails: "/customer/customerDetails",
        updateDetails: "/customer/updateDetails",
    }
    public coupon = {
        allCoupons: "/allCoupons",
    }
    public guest ={
        allSystemCoupons: "guest/allSystemCoupons",
        allCouponsByCategory: "/guest/allCouponsByCategory",
        allCouponsByMaxPrice: "guest/allCouponsByMaxPrice",
        register: "/guest/register",
    }
    public urls = {
        login: "/login",
    }
}

const globals = process.env.NODE_ENV === 'production' ? new ProductionGlobals() : new DevelopmentGlobals();

export default globals;