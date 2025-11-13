import { Customer } from "../modal/Customer";

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
    DELETE_CUSTOMER = "DELETE_CUSTOMER"
}

interface CustomerAction {
    type: CustomerActionTypes;
    payload?: any;
}

// קיימים
export function downloadCustomers(customers: Customer[]): CustomerAction {
    return { type: CustomerActionTypes.DOWNLOAD_CUSTOMERS, payload: customers };
}

export function downloadSingleCustomer(customer: Customer[]): CustomerAction {
    return { type: CustomerActionTypes.DOWNLOAD_SINGLE_CUSTOMER, payload: customer };
}

// חדשים – חסרים
export function addCustomer(customer: Customer): CustomerAction {
    return { type: CustomerActionTypes.ADD_CUSTOMER, payload: customer };
}

export function updateCustomer(customer: Customer): CustomerAction {
    return { type: CustomerActionTypes.UPDATE_CUSTOMER, payload: customer };
}

export function deleteCustomer(customerId: number): CustomerAction {
    return { type: CustomerActionTypes.DELETE_CUSTOMER, payload: customerId };
}

export function getSingleCustomer(customerId: number): CustomerAction {
    return { type: CustomerActionTypes.DOWNLOAD_SINGLE_CUSTOMER, payload: [customerId] };
}

export function customerReducer(state = initialState, action: CustomerAction): CustomerState {
    switch (action.type) {
        case CustomerActionTypes.DOWNLOAD_CUSTOMERS:
            return { ...state, customer: action.payload || [] };
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
        default:
            return state;
    }
}