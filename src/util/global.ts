class Globals {
}

class DevelopmentGlobals extends Globals {
    private static host = window.location.hostname;
    private static baseUrl = `http://${DevelopmentGlobals.host}:8080`;

    public admin = {
        adminMenu: `${DevelopmentGlobals.baseUrl}/api/adminMenu`,
        addCompany: `${DevelopmentGlobals.baseUrl}/api/admin/addCompany`,
        addCustomer: `${DevelopmentGlobals.baseUrl}/api/admin/addCustomer`,
        getAllCompanies: `${DevelopmentGlobals.baseUrl}/api/admin/getAllCompanies`,
        getAllCustomers: `${DevelopmentGlobals.baseUrl}/api/admin/getAllCustomers`,
        getOneCompany: `${DevelopmentGlobals.baseUrl}/api/admin/getOneCompany/`,
        getOneCustomer: `${DevelopmentGlobals.baseUrl}/api/admin/getOneCustomer/`,
        updateCompany: `${DevelopmentGlobals.baseUrl}/api/admin/updateCompany/`,
        updateCustomer: `${DevelopmentGlobals.baseUrl}/api/admin/updateCustomer`,
        deleteCompany: `${DevelopmentGlobals.baseUrl}/api/admin/deleteCompany/`,
        deleteCustomer: `${DevelopmentGlobals.baseUrl}/api/admin/deleteCustomer/`,
    }
    public company = {
        addCoupon: `${DevelopmentGlobals.baseUrl}/api/company/addCoupon`,
        deleteCoupon: `${DevelopmentGlobals.baseUrl}/api/company/deleteCoupon/`,
        getAllCoupons: `${DevelopmentGlobals.baseUrl}/api/company/allCoupons`,
        getCompanyDetails: `${DevelopmentGlobals.baseUrl}/api/company/companyDetails/`,
        getCouponByCategory: `${DevelopmentGlobals.baseUrl}/api/company/allCouponsByCategory/`,
        getCouponByMaxPrice: `${DevelopmentGlobals.baseUrl}/api/company/allCouponsByMaxPrice/`,
        updateCoupon: `${DevelopmentGlobals.baseUrl}/api/company/updateCoupon`,
        updateDetails: `${DevelopmentGlobals.baseUrl}/api/company/updateDetails`,
        getOneCompanyCoupon: `${DevelopmentGlobals.baseUrl}/api/company/getOneCompany/`
    }
    public customer = {
        purchaseCoupon: `${DevelopmentGlobals.baseUrl}/api/customer/purchaseCoupon/`,
        getAllCoupons: `${DevelopmentGlobals.baseUrl}/api/customer/customerCoupons`,
        getCouponsByCategory: `${DevelopmentGlobals.baseUrl}/api/customer/customerCouponsByCategory`,
        getCouponsByMaxPrice: `${DevelopmentGlobals.baseUrl}/api/customer/customerCouponsByMaxPrice`,
        getCustomerDetails: `${DevelopmentGlobals.baseUrl}/api/customer/customerDetails`,
        updateDetails: `${DevelopmentGlobals.baseUrl}/api/customer/updateDetails`,
    }
    public coupon = {
        allCoupons: `${DevelopmentGlobals.baseUrl}/api/allCoupons/`,
    }
    public guest ={
        allSystemCoupons: `${DevelopmentGlobals.baseUrl}/api/guest/allSystemCoupons`,
        allCouponsByMaxPrice: `${DevelopmentGlobals.baseUrl}/api/guest/allCouponsByMaxPrice`,
        allCouponsByCategory: `${DevelopmentGlobals.baseUrl}/api/guest/allCouponsByCategory`,
        register: `${DevelopmentGlobals.baseUrl}/api/guest/register`,
    }
    public urls = {
        login: `${DevelopmentGlobals.baseUrl}/api/login`,
        guest: `${DevelopmentGlobals.baseUrl}/api/`,
    }
}

class ProductionGlobals extends Globals {
    private static backendUrl = "https://coupons.runmydocker-app.com";

    public admin = {
        adminMenu: `${ProductionGlobals.backendUrl}/api/adminMenu`,
        addCompany: `${ProductionGlobals.backendUrl}/api/admin/addCompany`,
        // FIX: Changed addCustomers to addCustomer (singular)
        addCustomer: `${ProductionGlobals.backendUrl}/api/admin/addCustomer`,
        getAllCompanies: `${ProductionGlobals.backendUrl}/api/admin/getAllCompanies`,
        getAllCustomers: `${ProductionGlobals.backendUrl}/api/admin/getAllCustomers`,
        getOneCompany: `${ProductionGlobals.backendUrl}/api/admin/getOneCompany/`,
        getOneCustomer: `${ProductionGlobals.backendUrl}/api/admin/getOneCustomer/`,
        updateCompany: `${ProductionGlobals.backendUrl}/api/admin/updateCompany`,
        updateCustomer: `${ProductionGlobals.backendUrl}/api/admin/updateCustomer`,
        deleteCompany: `${ProductionGlobals.backendUrl}/api/admin/deleteCompany/`,
        deleteCustomer: `${ProductionGlobals.backendUrl}/api/admin/deleteCustomer/`,
    }
    public company = {
        addCoupon: `${ProductionGlobals.backendUrl}/api/company/addCoupon`,
        deleteCoupon: `${ProductionGlobals.backendUrl}/api/company/deleteCoupon/`,
        getAllCoupons: `${ProductionGlobals.backendUrl}/api/company/allCoupons`,
        getCompanyDetails: `${ProductionGlobals.backendUrl}/api/company/companyDetails/`,
        getCouponByCategory: `${ProductionGlobals.backendUrl}/api/company/allCouponsByCategory`,
        getCouponByMaxPrice: `${ProductionGlobals.backendUrl}/api/company/allCouponsByMaxPrice`,
        updateCoupon: `${ProductionGlobals.backendUrl}/api/company/updateCoupon`,
        updateDetails: `${ProductionGlobals.backendUrl}/api/company/updateDetails`,
        getOneCompanyCoupon: `${ProductionGlobals.backendUrl}/api/company/getOneCompany/`
    }
    public customer = {
        purchaseCoupon: `${ProductionGlobals.backendUrl}/api/customer/purchaseCoupon/`,
        getAllCoupons: `${ProductionGlobals.backendUrl}/api/customer/customerCoupons`,
        getCouponsByCategory: `${ProductionGlobals.backendUrl}/api/customer/customerCouponsByCategory/`,
        getCouponsByMaxPrice: `${ProductionGlobals.backendUrl}/api/customer/customerCouponsByMaxPrice/`,
        getCustomerDetails: `${ProductionGlobals.backendUrl}/api/customer/customerDetails`,
        updateDetails: `${ProductionGlobals.backendUrl}/api/customer/updateDetails`,
    }
    public coupon = {
        allCoupons: `${ProductionGlobals.backendUrl}/api/allCoupons`,
    }
    public guest ={
        allSystemCoupons: `${ProductionGlobals.backendUrl}/api/guest/allSystemCoupons`,
        allCouponsByCategory: `${ProductionGlobals.backendUrl}/api/guest/allCouponsByCategory`,
        allCouponsByMaxPrice: `${ProductionGlobals.backendUrl}/api/guest/allCouponsByMaxPrice`,
        register: `${ProductionGlobals.backendUrl}/api/guest/register`,
    }
    public urls = {
        login: `${ProductionGlobals.backendUrl}/api/login`,
    }
}

const globals = process.env.NODE_ENV === 'production' ? new ProductionGlobals() : new DevelopmentGlobals();

export default globals;