import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authState';
import { companyReducer } from "./companyState";
import { customerReducer } from './customerState';
import { couponReducer } from './couponState';

const reducers = {
    authState: authReducer,
    companyState: companyReducer,
    customerState: customerReducer,
    couponState: couponReducer
};

export const store = configureStore({ reducer: reducers });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;