import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MainLayout from './Components/mainLayout/mainLayout';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import { loadToken } from './redux/authState';
import { ThemeProvider } from '@mui/material/styles'; // Import MUI ThemeProvider
import myTheme from './util/myTheme'; // Import custom theme

// Load token from localStorage
const token = localStorage.getItem('token');
if (token) {
    store.dispatch(loadToken(token));
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={myTheme}>
                <BrowserRouter>
                    <MainLayout />
                </BrowserRouter>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);

reportWebVitals();