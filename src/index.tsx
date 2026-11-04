
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import MainLayout from "./Components/mainLayout/mainLayout";
import { store } from "./redux/store";
import { loadToken } from "./redux/authState";
import { getValidStoredToken } from "./util/session";
import myTheme from "./util/myTheme";
import reportWebVitals from "./reportWebVitals";

const token = getValidStoredToken();

if (token) {
    store.dispatch(loadToken(token));
}

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

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
