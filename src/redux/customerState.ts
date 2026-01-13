import { Customer } from "../modal/Customer";
import { Coupon } from "../modal/Coupon";

export interface CustomerState {
    customer: Customer[];
}

export const initialState: CustomerState = {
    customer: []
};

export enum CustomerActionTypes {
    DOWNLOAD_CUSTOMERS = "DOWNLOAD_CUSTOMERS",
    DOWNLOAD_SINGLE_CUSTOMER = "DOWNLOAD_SINGLE_CUSTOMER",
    ADD_CUSTOMER = "ADD_CUSTOMER",
    UPDATE_CUSTOMER = "UPDATE_CUSTOMER",
    DELETE_CUSTOMER = "DELETE_CUSTOMER",
    PURCHASE_COUPON = "PURCHASE_COUPON" // Action for instant update
}

interface CustomerAction {
    type: CustomerActionTypes;
    payload?: any;
}

export function downloadCustomers(customers: Customer[]): CustomerAction {
    return { type: CustomerActionTypes.DOWNLOAD_CUSTOMERS, payload: customers };
}

export function downloadSingleCustomer(customer: Customer[]): CustomerAction {
    return { type: CustomerActionTypes.DOWNLOAD_SINGLE_CUSTOMER, payload: customer };
}

export function addCustomer(customer: Customer): CustomerAction {
    return { type: CustomerActionTypes.ADD_CUSTOMER, payload: customer };
}

export function updateCustomer(customer: Customer): CustomerAction {
    return { type: CustomerActionTypes.UPDATE_CUSTOMER, payload: customer };
}

export function deleteCustomer(customerId: number): CustomerAction {
    return { type: CustomerActionTypes.DELETE_CUSTOMER, payload: customerId };
}

export function couponPurchased(coupon: Coupon): CustomerAction {
    return { type: CustomerActionTypes.PURCHASE_COUPON, payload: coupon };
}

export function customerReducer(state = initialState, action: CustomerAction): CustomerState {
    switch (action.type) {
        case CustomerActionTypes.DOWNLOAD_CUSTOMERS:
        case CustomerActionTypes.DOWNLOAD_SINGLE_CUSTOMER:
            return { ...state, customer: action.payload || [] };
        
        case CustomerActionTypes.ADD_CUSTOMER:
            return { ...state, customer: [...state.customer, action.payload] };
        
        case CustomerActionTypes.UPDATE_CUSTOMER:
            return {
                ...state,
                customer: state.customer.map(c => c.id === action.payload.id ? action.payload : c)
            };
        
        case CustomerActionTypes.DELETE_CUSTOMER:
            return {
                ...state,
                customer: state.customer.filter(c => c.id !== action.payload)
            };

        case CustomerActionTypes.PURCHASE_COUPON:
            // Add the coupon to the store immediately to disable the button
            if (state.customer.length > 0) {
                const updatedCustomer = { ...state.customer[0] };
                if (!updatedCustomer.coupons) updatedCustomer.coupons = [];
                // Check prevent duplicate just in case
                if (!updatedCustomer.coupons.find(c => c.id === action.payload.id)) {
                    updatedCustomer.coupons = [...updatedCustomer.coupons, action.payload];
                }
                return { ...state, customer: [updatedCustomer] };
            }
            return state;

        default:
            return state;
    }
}