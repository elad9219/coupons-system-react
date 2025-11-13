import { Company } from "../modal/Company";

export interface CompanyState {
    company: Company[];
}

export const initialState: CompanyState = {
    company: []
};

export enum CompanyActionTypes {
    DOWNLOAD_COMPANIES = "DOWNLOAD_COMPANIES",
    DOWNLOAD_SINGLE_COMPANY = "DOWNLOAD_SINGLE_COMPANY",
    ADD_COMPANY = "ADD_COMPANY",
    UPDATE_COMPANY = "UPDATE_COMPANY",
    DELETE_COMPANY = "DELETE_COMPANY"
}

interface CompanyAction {
    type: CompanyActionTypes;
    payload?: any;
}

export function downloadCompanies(companies: Company[]): CompanyAction {
    return { type: CompanyActionTypes.DOWNLOAD_COMPANIES, payload: companies };
}

export function downloadSingleCompany(company: Company[]): CompanyAction {
    return { type: CompanyActionTypes.DOWNLOAD_SINGLE_COMPANY, payload: company };
}

export function addCompany(company: Company): CompanyAction {
    return { type: CompanyActionTypes.ADD_COMPANY, payload: company };
}

export function updateCompany(company: Company): CompanyAction {
    return { type: CompanyActionTypes.UPDATE_COMPANY, payload: company };
}

export function deleteCompany(companyId: number): CompanyAction {
    return { type: CompanyActionTypes.DELETE_COMPANY, payload: companyId };
}

export function getSingleCompany(companyId: number): CompanyAction {
    return { type: CompanyActionTypes.DOWNLOAD_SINGLE_COMPANY, payload: [companyId] }; // או רק id – תלוי ב-reducer
}

export function companyReducer(state = initialState, action: CompanyAction): CompanyState {
    switch (action.type) {
        case CompanyActionTypes.DOWNLOAD_COMPANIES:
            return { ...state, company: action.payload || [] };
        case CompanyActionTypes.DOWNLOAD_SINGLE_COMPANY:
            return { ...state, company: action.payload || [] };
        case CompanyActionTypes.ADD_COMPANY:
            return { ...state, company: [...state.company, action.payload] };
        case CompanyActionTypes.UPDATE_COMPANY:
            return {
                ...state,
                company: state.company.map(c => c.id === action.payload.id ? action.payload : c)
            };
        case CompanyActionTypes.DELETE_COMPANY:
            return {
                ...state,
                company: state.company.filter(c => c.id !== action.payload)
            };
        default:
            return state;
    }
}